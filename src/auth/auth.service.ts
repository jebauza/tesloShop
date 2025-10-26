import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const {password, ...userData} = createUserDto;
      const user = this.usersRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.usersRepository.save(user);
      const { password: _, ...safeUser } = user;

      return {
        ...safeUser,
        token: this.getJwtToken({email: user.email})
      };
      
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {

    const {email, password} = loginUserDto;
    const user = await this.usersRepository.findOne({
      where: {email},
      select: {email: true, password: true}
    });

    if (!user)
      throw new UnauthorizedException('Invalid credentials');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...safeUser } = user;

    return {
      ...safeUser,
      token: this.getJwtToken({email: user.email})
    };
  }

  private getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );

    return token;
  }

  private handleDBErrors( error: any ): never {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Please check server logs');
  }
}
