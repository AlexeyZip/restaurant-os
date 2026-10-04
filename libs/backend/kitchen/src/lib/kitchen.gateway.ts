import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace } from 'socket.io';
import { socketAuthMiddleware } from '@restaurant-os/auth';

const LISTENER_ROLES = ['KITCHEN', 'ADMIN'];

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'kitchen',
})
export class KitchenGateway implements OnGatewayInit {
  // With a `namespace` option Nest injects the Namespace, not the root Server:
  // emitting on it reaches only clients connected to /kitchen.
  @WebSocketServer()
  server!: Namespace;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(namespace: Namespace) {
    namespace.use(socketAuthMiddleware(this.jwtService, LISTENER_ROLES));
  }

  // Only the id goes over the socket; clients load the full order through
  // the guarded REST API so addresses/notes never travel through here.
  emitOrderCreated(order: { id: string }) {
    this.server.emit('order.created', order);
  }

  emitOrderStatusChanged(order: { id: string; status: string }) {
    this.server.emit('order.status.changed', order);
  }
}
