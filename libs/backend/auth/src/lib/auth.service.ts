import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '@restaurant-os/database';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string }> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: { email, passwordHash },
    });

    return { id: user.id, email: user.email };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roleNames = user.roles.map((role) => role.role.name);

    return this.generateTokens(user.id, user.email, roleNames);
  }

  // TODO(Phase 7 - Production hardening): single-use rotation has no grace
  // period, so near-simultaneous refresh calls with the same token (e.g.
  // rapid page reloads racing an in-flight request) will 401 the second
  // call even though the first one already succeeded server-side. That's
  // an accepted UX rough edge for now - see the comment below for the
  // actual correctness bug this used to have (crash, not just a 401).
  async refresh(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Prisma treats `where: { token: undefined }` as "no filter", so a request
    // without the cookie would otherwise match (and burn) every user's token.
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    // Atomic claim-and-invalidate: the `used: false` check lives in the
    // WHERE clause itself, not in a separate read beforehand. Postgres
    // guarantees only one concurrent UPDATE can match a given row, so if
    // two requests race on the same token, exactly one of them gets
    // count === 1 (the "winner") and the other gets count === 0 (the
    // "loser", which correctly 401s below instead of also generating a
    // token pair - see the previous read-then-update version, which had
    // a TOCTOU window that let both requests through and then crashed on
    // a duplicate refresh-token INSERT, not just a spurious 401).
    const claim = await this.prisma.refreshToken.updateMany({
      where: { token, used: false, expiresAt: { gt: new Date() } },
      data: { used: true },
    });

    if (claim.count === 0) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.prisma.refreshToken.findUniqueOrThrow({
      where: { token },
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: stored.userId },
      include: { roles: { include: { role: true } } },
    });

    const roleNames = user.roles.map((ur) => ur.role.name);

    return this.generateTokens(user.id, user.email, roleNames);
  }

  async logout(token: string | undefined): Promise<void> {
    // Same undefined-means-no-filter trap as in refresh(): nothing to
    // invalidate without a cookie, and it must never touch other users.
    if (!token) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { used: true },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email, roles };

    // jwtid: without it, two tokens signed for the same user within the
    // same second would be byte-for-byte identical (JWT signing is
    // deterministic given the same payload+iat+secret) - which is exactly
    // what caused the duplicate-key crash this method used to have. A
    // random jti makes every signature unique regardless of timing, on
    // top of the atomic claim in refresh() above (defense in depth: two
    // independent fixes for the same underlying race).
    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        expiresIn: '15m',
        jwtid: randomUUID(),
      },
    );
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        expiresIn: '30d',
        jwtid: randomUUID(),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
