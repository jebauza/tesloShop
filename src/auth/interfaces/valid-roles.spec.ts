import { ValidRoles } from './valid-roles';

describe('Valid roles Enum', () => {
  it('should have correct values', () => {
    expect(ValidRoles.admin).toBe('admin');
    expect(ValidRoles.superUser).toBe('super-user');
    expect(ValidRoles.user).toBe('user');
  });

  it('should have the correct keys and values', () => {
    const valueToHave = ['admin', 'super-user', 'user'];
    const keyToHave = ['admin', 'superUser', 'user'];

    expect(Object.values(ValidRoles)).toEqual(
      expect.arrayContaining(valueToHave),
    );
    expect(Object.keys(ValidRoles)).toEqual(expect.arrayContaining(keyToHave));
  });
});
