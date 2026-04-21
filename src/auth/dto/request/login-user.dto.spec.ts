import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { plainToClass, plainToInstance } from 'class-transformer';

describe('LoginUserDto', () => {
  const data = {
    email: 'juan@email.com',
    password: 'Abcd1234!',
  };

  it('', async () => {
    const dto = plainToClass(LoginUserDto, data);

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    const dto = new LoginUserDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    expect(errors.map((e) => e.property)).toEqual(['email', 'password']);
  });

  it('should fail if fields are empty', async () => {
    const dto = plainToInstance(LoginUserDto, { email: '', password: '' });

    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    expect(errors.map((e) => e.property)).toEqual(['email', 'password']);
  });

  it('should fail if email is not a valid email', async () => {
    const validation: string = 'isEmail';
    const dto = plainToInstance(LoginUserDto, {
      email: 'not-an-email',
      password: data.password,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`email:${validation}`]);
  });

  it('should fail if fullname or password are not strings', async () => {
    const validation: string = 'isString';
    const dto = plainToInstance(LoginUserDto, {
      email: data.email,
      password: 4,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`password:${validation}`]);
  });

  it('should fail if fields are shorter than minLength', async () => {
    const validation: string = 'minLength';
    const dto = plainToInstance(LoginUserDto, {
      email: data.email,
      password: 'a'.repeat(5),
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`password:${validation}`]);
  });

  it('should fail if fields are longer than maxLength', async () => {
    const validation: string = 'maxLength';
    const dto = plainToInstance(LoginUserDto, {
      email: 'a'.repeat(101),
      password: 'a'.repeat(51),
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`email:${validation}`, `password:${validation}`]);
  });

  it('should fail if password does not match the required pattern', async () => {
    const validation: string = 'matches';
    const dto = plainToInstance(LoginUserDto, {
      email: data.email,
      password: 'a'.repeat(10),
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`password:${validation}`]);
  });
});
