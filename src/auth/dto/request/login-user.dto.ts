import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'juan@email.com', description: 'User email' })
  @IsEmail()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    example: 'Abcd1234!',
    description: 'Password with uppercase, lowercase and a number',
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must have an uppercase, a lowercase and a number',
  })
  password: string;
}
