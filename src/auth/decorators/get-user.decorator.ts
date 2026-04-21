import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const getUser = (data: string, ctx: ExecutionContext) => {
  // console.log({data});
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  if (!user) throw new InternalServerErrorException('User not found (request)');

  return data ? user[data] : user;
};

export const GetUser = createParamDecorator(getUser);
