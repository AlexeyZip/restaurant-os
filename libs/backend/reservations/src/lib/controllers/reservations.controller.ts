import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  Roles,
  CurrentUser,
  RolesGuard,
} from '@restaurant-os/auth';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dto/create-reservation.dto';
import { UpdateReservationStatusDto } from '../dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createReservation(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.createReservation(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getReservations(@CurrentUser() user: { userId: string; roles: string[] }) {
    return this.reservationsService.getReservations(user.userId, user.roles);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getReservationById(@Param('id') id: string) {
    return this.reservationsService.getReservationById(id);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateReservationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    return this.reservationsService.updateReservationStatus(id, dto);
  }
}
