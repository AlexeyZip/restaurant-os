import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
    });
  }

  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    roles: string[];
  } {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
