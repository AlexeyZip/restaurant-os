import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  tableId!: string;
  @IsInt()
  @IsNotEmpty()
  guestCount!: number;
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startsAt!: Date;
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endsAt!: Date;
  @IsString()
  @IsOptional()
  notes?: string;
}
