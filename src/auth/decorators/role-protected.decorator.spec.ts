import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { META_ROLES, RoleProtected } from './role-protected.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
  // SetMetadata: jest.fn().mockImplementation((key, value) => ({
  //   key,
  //   value,
  // })),
}));

describe('RoleProtectedDecorator', () => {
  it('', () => {
    const roles = [ValidRoles.admin, ValidRoles.user];

    RoleProtected(...roles);
    expect(SetMetadata).toHaveBeenCalledWith(META_ROLES, roles);

    // const result = RoleProtected(...roles);
    // expect(result).toEqual({
    //   key: META_ROLES,
    //   value: roles,
    // });
  });
});
