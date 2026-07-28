import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  @IsInt()
  @Min(0)
  order!: number;
}
