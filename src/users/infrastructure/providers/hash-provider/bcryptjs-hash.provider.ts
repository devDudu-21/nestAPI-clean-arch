import { hashProvider } from '@/shared/application/providers/hash-provider';
import { compare, genSalt, hash } from 'bcryptjs';

export class BcryptjsHashProvider implements hashProvider {
  async generateHash(payload: string): Promise<string> {
    return hash(payload, await BcryptjsHashProvider.genSalt());
  }
  compareHash(payload: string, hash: string): Promise<boolean> {
    return compare(payload, hash);
  }

  private static genSalt(): Promise<string> {
    return new Promise((resolve, reject) => {
      genSalt(12, (err, salt) => {
        if (err) {
          return reject(err);
        }
        resolve(salt);
      });
    });
  }
}
