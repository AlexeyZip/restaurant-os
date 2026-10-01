import { jwtDecode } from 'jwt-decode';

/**
 * Shape of the JWT payload our backend signs - see
 * AuthService.generateTokens()'s `{ sub: userId, email, roles }`, plus the
 * standard claims jsonwebtoken adds automatically (iat/exp/jti).
 */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
  jti: string;
}

export function decodeAccessToken(token: string): AccessTokenPayload {
  return jwtDecode<AccessTokenPayload>(token);
}
