import { OrderStatus } from '@restaurant-os/generated/prisma';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status!: OrderStatus;
  @IsString()
  @IsOptional()
  cancelReason?: string;
}
