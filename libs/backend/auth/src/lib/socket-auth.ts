import { JwtService } from '@nestjs/jwt';
import type { Socket } from 'socket.io';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface SocketUser {
  userId: string;
  email: string;
  roles: string[];
}

/**
 * Socket.IO middleware factory: authenticates the handshake with the same
 * JWT the HTTP API uses. Runs once per connection attempt; calling
 * `next(error)` rejects it, so an unauthorized client never becomes a
 * connected socket. On success the user is available as `socket.data.user`.
 *
 * Error messages are a contract with the frontend: 'unauthorized' means the
 * token is missing/invalid/expired (worth a refresh + retry), 'forbidden'
 * means a valid user without a required role (retrying cannot help).
 */
export function socketAuthMiddleware(
  jwtService: JwtService,
  allowedRoles?: string[],
) {
  return (socket: Socket, next: (error?: Error) => void) => {
    const token: unknown = socket.handshake.auth['token'];
    if (typeof token !== 'string') {
      return next(new Error('unauthorized'));
    }

    let payload: JwtPayload;
    try {
      payload = jwtService.verify<JwtPayload>(token);
    } catch {
      return next(new Error('unauthorized'));
    }

    if (
      allowedRoles &&
      !payload.roles.some((role) => allowedRoles.includes(role))
    ) {
      return next(new Error('forbidden'));
    }

    const user: SocketUser = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
    socket.data.user = user;
    next();
  };
}
