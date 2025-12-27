import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: '1bb76bed-73a4-46ad-b849-52cadb434222',
  })
  id: string;

  @ApiProperty({
    example: 'juan@email.com',
  })
  email: string;

  @ApiProperty({
    example: 'Juan Perez',
  })
  fullname: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}
