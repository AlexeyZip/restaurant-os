import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { DishAvailability } from '@restaurant-os/generated/prisma';

export class CreateDishDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsInt()
  @Min(0)
  basicPrice!: number;
  @IsString()
  @IsOptional()
  imageUrl?: string;
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
  @IsEnum(DishAvailability)
  @IsOptional()
  availability?: DishAvailability;
}
