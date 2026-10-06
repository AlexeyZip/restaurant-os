export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  // Both token kinds share one secret and one payload shape, so this claim
  // is the only thing that stops a long-lived refresh token from being used
  // as an access token.
  type: TokenType;
}
