import { BcryptjsHashProvider } from '../../bcryptjs-hash.provider';

describe('BcryptjsHashProvider unit tests', () => {
  let sut: BcryptjsHashProvider;

  beforeEach(() => {
    sut = new BcryptjsHashProvider();
  });

  it('should return encrypted password', async () => {
    const password = 'TestPassword123';
    const hash = await sut.generateHash(password);
    const isValid = await sut.compareHash(password, hash);
    expect(isValid).toBeTruthy();
  });

  it('should return false on invalid password and hash comparison', async () => {
    const password = 'TestPassword123';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash('fake', hash);
    expect(result).toBeFalsy();
  });

  it('should return true on valid password and hash comparison', async () => {
    const password = 'TestPassword123';
    const hash = await sut.generateHash(password);
    const result = await sut.compareHash(password, hash);
    expect(result).toBeTruthy();
  });

  it('should generate salt correctly', async () => {
    const spyGenSalt = jest.spyOn(BcryptjsHashProvider, 'genSalt');
    const salt = await BcryptjsHashProvider.genSalt();
    expect(salt).toBeDefined();
    expect(spyGenSalt).toHaveBeenCalled();
    spyGenSalt.mockRestore();
  });
});
