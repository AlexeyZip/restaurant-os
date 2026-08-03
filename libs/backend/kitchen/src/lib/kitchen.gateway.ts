import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'kitchen',
})
export class KitchenGateway {
  @WebSocketServer()
  server!: Server;

  emitOrderStatusChanged(order: { id: string; status: string }) {
    this.server.emit('order.status.changed', order);
  }
}
