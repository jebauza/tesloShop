import { JwtPayload } from './jwt-payload.interface';

describe('JwtPayload interface', () => {
  it('should return true', () => {
    const id = '1234567890';
    const validPayload: JwtPayload = { id: id };

    expect(validPayload.id).toBe(id);
  });
});
