import { Module } from '@nestjs/common';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthModule } from '@restaurant-os/auth';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
