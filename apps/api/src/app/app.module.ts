import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthModule } from '@restaurant-os/auth';
import { MenuModule } from '@restaurant-os/menu';

@Module({
  imports: [DatabaseModule, AuthModule, MenuModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
