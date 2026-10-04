import { Module } from '@nestjs/common';
import { AuthModule } from '@restaurant-os/auth';
import { KitchenGateway } from './kitchen.gateway';

@Module({
  imports: [AuthModule],
  providers: [KitchenGateway],
  exports: [KitchenGateway],
})
export class KitchenModule {}
