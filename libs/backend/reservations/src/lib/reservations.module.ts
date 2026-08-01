import { Module } from '@nestjs/common';
import { ReservationsController } from './controllers/reservations.controller';
import { TableController } from './controllers/table.controller';
import { DatabaseModule } from '@restaurant-os/database';
import { AuthModule } from '@restaurant-os/auth';
import { ReservationsService } from './services/reservations.service';
import { TableService } from './services/table.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [ReservationsService, TableService],
  controllers: [ReservationsController, TableController],
})
export class ReservationsModule {}
