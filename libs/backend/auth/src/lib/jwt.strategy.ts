import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { getJwtSecret } from './jwt-secret';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getJwtSecret(),
    });
  }

  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    roles: string[];
  } {
    // A refresh token is signed with the same secret, so the signature check
    // alone would accept it. Only access tokens may authenticate API calls.
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
