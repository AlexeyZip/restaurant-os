import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { SocketUser, socketAuthMiddleware } from '@restaurant-os/auth';

const roomFor = (userId: string) => `user:${userId}`;

// Customer-facing channel: any authenticated user may connect, but each
// socket only joins the room of its own user id, so it can only ever receive
// events about that user's own orders.
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'orders',
})
export class OrderGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Namespace;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(namespace: Namespace) {
    namespace.use(socketAuthMiddleware(this.jwtService));
  }

  // Runs after the auth middleware accepted the handshake.
  handleConnection(socket: Socket) {
    const user = socket.data.user as SocketUser;
    socket.join(roomFor(user.userId));
  }

  // Safe to include cancelReason: this goes only to the order's owner.
  emitStatusChangedToOwner(
    userId: string,
    order: { id: string; status: string; cancelReason: string | null },
  ) {
    this.server.to(roomFor(userId)).emit('order.status.changed', order);
  }
}
