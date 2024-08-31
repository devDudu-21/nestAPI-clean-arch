import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  it('should be defined', () => {
    let authService: AuthService;
    expect(new AuthGuard(authService)).toBeDefined();
  });
});
