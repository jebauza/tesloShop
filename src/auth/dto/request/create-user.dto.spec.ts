import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { plainToInstance } from 'class-transformer';

describe('CreateUserDto', () => {
  const data = {
    email: 'juan@email.com',
    fullname: 'Juan Perez',
    password: 'Abcd1234!',
  };

  it('should be valid with correct data', async () => {
    const dto = new CreateUserDto();
    dto.email = data.email;
    dto.fullname = data.fullname;
    dto.password = data.password;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if required fields are missing', async () => {
    const dto = new CreateUserDto();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(errors.map((e) => e.property)).toEqual([
      'email',
      'fullname',
      'password',
    ]);
  });

  it('should fail if fields are empty', async () => {
    const input = { email: '', fullname: '', password: '' };
    const dto = plainToInstance(CreateUserDto, input);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('should fail if email is not a valid email', async () => {
    const validation: string = 'isEmail';
    const dto = plainToInstance(CreateUserDto, {
      email: 'not-an-email',
      fullname: data.fullname,
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
    const dto = plainToInstance(CreateUserDto, {
      email: data.email,
      fullname: 3,
      password: 4,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`fullname:${validation}`, `password:${validation}`]);
  });

  it('should fail if fields are shorter than minLength', async () => {
    const validation: string = 'minLength';
    const dto = plainToInstance(CreateUserDto, {
      email: data.email,
      fullname: '',
      password: 'a'.repeat(5),
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`fullname:${validation}`, `password:${validation}`]);
  });

  it('should fail if fields are longer than maxLength', async () => {
    const validation: string = 'maxLength';
    const dto = plainToInstance(CreateUserDto, {
      email: 'a'.repeat(101),
      fullname: 'a'.repeat(256),
      password: 'a'.repeat(51),
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(2);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([
      `email:${validation}`,
      `fullname:${validation}`,
      `password:${validation}`,
    ]);
  });

  it('should fail if password does not match the required pattern', async () => {
    const validation: string = 'matches';
    const dto = plainToInstance(CreateUserDto, {
      email: data.email,
      fullname: data.fullname,
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
