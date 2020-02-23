import { TokenInterceptor } from './token-interceptor';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';

describe('TokenInterceptor', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ]
    });

    authService = TestBed.get(AuthService);
  });

  it('should create an instance', () => {
    expect(new TokenInterceptor(authService)).toBeTruthy();
  });
});
