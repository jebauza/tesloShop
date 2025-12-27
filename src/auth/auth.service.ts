import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthResponseDto } from './dto/auth-response.dto';
import { handleDBErrors } from '../common/helpers/errors.helper';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    const user = await this.create(createUserDto);

    const authResponseDto: AuthResponseDto = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      token: this.getJwtToken({id: user.id})
    };

    return authResponseDto;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const {password, ...userData} = createUserDto;
      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.usersRepository.save(user);

      return user;

    } catch (error) {
      handleDBErrors(error);
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const {email, password} = loginUserDto;
    const user = await this.usersRepository.findOne({
      where: {email},
      select: {
        id: true, 
        email: true,
        password: true,
        fullname: true,
      }
    });

    if (!user)
      throw new UnauthorizedException('Invalid credentials');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials');

    const authResponseDto: AuthResponseDto = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      token: this.getJwtToken({id: user.id})
    };

    return authResponseDto;
  }

  checkAuthStatus(user: User): AuthResponseDto {

    const authResponseDto: AuthResponseDto = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      token: this.getJwtToken({id: user.id})
    };

    return authResponseDto;
  }

  private getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );

    return token;
  }
}
