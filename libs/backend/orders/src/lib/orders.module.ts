import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthModule } from '@restaurant-os/auth';
import { OrderService } from './orders.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrdersModule {}
