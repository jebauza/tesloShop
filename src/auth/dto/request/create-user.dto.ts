import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({ example: 'juan@email.com', description: 'User email' })
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @ApiProperty({ example: 'Juan Perez', description: 'User full name' })
  fullname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and a number',
  })
  @ApiProperty({
    example: 'Abcd1234!',
    description: 'Password with uppercase, lowercase, and a number',
    minLength: 6,
    maxLength: 50,
  })
  password: string;
}
