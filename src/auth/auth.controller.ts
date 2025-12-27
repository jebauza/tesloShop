import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Req, Headers, SetMetadata} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import type { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'OK', type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Bad Request', example: { statusCode: 400, message: 'Key (...)=(...) already exists.', error: 'Bad Request' } })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error', example: { statusCode: 500, message: 'Internal server error' } })
  registerUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ description: 'OK', type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized', example: { statusCode: 401, message: 'Invalid credentials', error: 'Unauthorized' } })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get logged-in user information' })
  @ApiBearerAuth('JWT')
  @ApiOkResponse({ description: 'OK', type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  meUser(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,

    @GetUser() user: User,
    @GetUser('email') email: string,

    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    console.log(request);

    return {
      user,
      email,
      rawHeaders,
      headers,
    };
  }

  @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(
    @GetUser() user: User,
  ) {
    return {
      user,
    };
  }

  @Get('private3')
  @Auth()
  testingPrivateRoute3(
    @GetUser() user: User,
  ) {
    return {
      user,
    };
  }

  @Get('private4')
  @Auth(ValidRoles.admin)
  testingPrivateRoute4(
    @GetUser() user: User,
  ) {
    return {
      user,
    };
  }
}
