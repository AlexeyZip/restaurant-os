import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthModule } from '@restaurant-os/auth';
import { OrderService } from './orders.service';
import { KitchenModule } from '@restaurant-os/kitchen';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [DatabaseModule, AuthModule, KitchenModule],
  providers: [OrderService, OrderGateway],
  controllers: [OrderController],
})
export class OrdersModule {}
