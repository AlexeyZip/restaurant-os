import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @IsNotEmpty()
  number!: number;
  @IsInt()
  @IsNotEmpty()
  capacity!: number;
  @IsBoolean()
  @IsNotEmpty()
  active!: boolean;
}
