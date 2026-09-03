import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
  IsDate,
  MinDate,
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
  /** Omit for "as soon as possible" - the default for most orders. */
  @IsDate()
  @Type(() => Date)
  @MinDate(() => new Date(), {
    message: 'scheduledFor must be a time in the future',
  })
  @IsOptional()
  scheduledFor?: Date;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
