import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  dishId!: string;
  @IsInt()
  @Min(1)
  quantity!: number;
}
