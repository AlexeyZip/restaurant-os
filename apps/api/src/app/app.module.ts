import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthModule } from '@restaurant-os/auth';
import { MenuModule } from '@restaurant-os/menu';
import { OrdersModule } from '@restaurant-os/orders';

@Module({
  imports: [DatabaseModule, AuthModule, MenuModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
