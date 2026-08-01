import { ReservationStatus } from '@restaurant-os/generated/prisma';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  @IsNotEmpty()
  status!: ReservationStatus;
  @IsString()
  @IsOptional()
  cancelReason?: string;
}
