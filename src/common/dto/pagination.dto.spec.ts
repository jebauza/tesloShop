import { plainToClass, plainToInstance } from 'class-transformer';
import { PaginationDto } from './pagination.dto';
import { validate } from 'class-validator';

describe('PaginationDto', () => {
  const data = {
    offset: 5,
    limit: 10,
    gender: 'men',
  };

  it('should be valid with correct data', async () => {
    const dto = plainToClass(PaginationDto, data);

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should be valid with allowed gender values', () => {
    const genderValues = ['men', 'women', 'kid', 'unisex'];

    genderValues.forEach(async (gender) => {
      const dto = plainToInstance(PaginationDto, {
        gender: gender,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  it('should be valid when properties are not provided', async () => {
    const dto = new PaginationDto();

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if fields are empty', async () => {
    const dto = plainToInstance(PaginationDto, {
      offset: '',
      limit: '',
      gender: '',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(3);
    expect(errors.map((e) => e.property)).toEqual([
      'offset',
      'limit',
      'gender',
    ]);
  });

  it('should fail if fields are not integers', async () => {
    const validation: string = 'isInt';
    const dto = plainToInstance(PaginationDto, {
      offset: 'not-int',
      limit: 'not-int',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`offset:${validation}`, `limit:${validation}`]);
  });

  it('should fail if fields are not positive numbers', async () => {
    const validation: string = 'isPositive';
    const dto = plainToInstance(PaginationDto, {
      offset: -1,
      limit: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(2);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`offset:${validation}`, `limit:${validation}`]);
  });

  it('should fail if gender is not an allowed value', async () => {
    const validation: string = 'isIn';
    const dto = plainToInstance(PaginationDto, {
      gender: 'not-valid',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(1);
    expect(
      errors.map(
        (e) => `${e.property}:${e.constraints?.[validation] ? validation : ''}`,
      ),
    ).toEqual([`gender:${validation}`]);
  });
});
