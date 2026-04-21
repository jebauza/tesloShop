import { User } from './user.entity';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.id = '123e4567-e89b-12d3-a456-426614174000';
    user.email = 'test@test.com';
    user.password = 'test-password-123';
    user.fullname = 'Test User';
    user.isActive = true;
    user.roles = ['user'];
  });

  it('should be defined', () => {
    expect(user).toBeDefined();
    expect(user).toBeInstanceOf(User);
  });

  it('should have all required properties', () => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('password');
    expect(user).toHaveProperty('fullname');
  });

  it('should have the correct property types', () => {
    expect(typeof user.id).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.password).toBe('string');
    expect(typeof user.fullname).toBe('string');
    expect(typeof user.isActive).toBe('boolean');
    expect(Array.isArray(user.roles)).toBeTruthy();
    user.roles.forEach((role) => {
      expect(typeof role).toBe('string');
    });
  });

  it('should assign and read properties correctly', () => {
    expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(user.email).toBe('test@test.com');
    expect(user.password).toBe('test-password-123');
    expect(user.fullname).toBe('Test User');
    expect(user.isActive).toBe(true);
    expect(user.roles).toEqual(['user']);

    expect(JSON.stringify(user)).toEqual(
      '{"id":"123e4567-e89b-12d3-a456-426614174000","email":"test@test.com","password":"test-password-123","fullname":"Test User","isActive":true,"roles":["user"]}',
    );
  });

  it('should allow property reassignment', () => {
    user.email = 'test2@test.com';
    user.password = 'test-password-456';
    user.fullname = 'Test User 2';
    user.isActive = false;
    user.roles = ['admin'];

    expect(user.email).toBe('test2@test.com');
    expect(user.password).toBe('test-password-456');
    expect(user.fullname).toBe('Test User 2');
    expect(user.isActive).toBe(false);
    expect(user.roles).toEqual(['admin']);
  });

  it('calling checkFieldsBeforeInsert', () => {
    user.email = 'TEST@test.com';
    user.checkFieldsBeforeInsert();

    expect(user.email).toBe('test@test.com');
  });

  it('calling checkFieldsBeforeUpdate', () => {
    user.email = 'TEST@test.com';
    user.checkFieldsBeforeUpdate();

    expect(user.email).toBe('test@test.com');
  });
});
