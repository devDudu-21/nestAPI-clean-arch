import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type GeneratedJwtProps = {
  accessToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvConfigService,
  ) {}

  async generateJwt(userId: string): Promise<GeneratedJwtProps> {
    const accessToken = await this.jwtService.signAsync({ id: userId }, {});
    return { accessToken };
  }

  async verifyJwt(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.getJwtSecret(),
    });
  }
}
