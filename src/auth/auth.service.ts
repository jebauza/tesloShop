import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

      return safeUser;
      // TODO: return the access JWT
      
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  login(loginAuthDto: LoginAuthDto) {
    return loginAuthDto;
  }

  private handleDBErrors( error: any ): never {
    if ( error.code === '23505' )
      throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Please check server logs');
  }
}
