import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { OrderType } from '@restaurant-os/generated/prisma';
import { CreateOrderItemDto } from './create-order-item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType!: OrderType;
  @IsString()
  @IsOptional()
  deliveryAddress?: string;
  @IsString()
  @IsOptional()
  notes?: string;
  @IsInt()
  @IsOptional()
  tableNumber?: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
