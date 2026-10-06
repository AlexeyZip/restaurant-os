import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Unlike registration there is no minimum length here: accounts created
// before the password rule existed must still get a plain 401 on a wrong
// password, not a validation error that leaks the rule.
export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}
