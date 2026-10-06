import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // bcrypt only uses the first 72 bytes, so a longer password adds no
  // security and just invites pointless hashing work.
  @MaxLength(72, { message: 'Password must be at most 72 characters long' })
  password!: string;
}
