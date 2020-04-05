import { TokenInterceptor, authProviders } from './token-interceptor';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('TokenInterceptor', () => {
  let authService: AuthService;
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
      ],
      providers: [
        authProviders({ apiPath: 'test/' })
      ]
    });

    authService = TestBed.get(AuthService);
    http = TestBed.get(HttpClient);
    controller = TestBed.get(HttpTestingController);

    authService.getStoredTokenData = () => ({ id_token: 'token' });
    authService.setStoredTokenData = () => { };
    authService.setupTokenRefresh = async () => { };
    authService.auth();
  });

  it('should create an instance', () => {
    expect(new TokenInterceptor(authService, { apiPath: 'test/' })).toBeTruthy();
  });

  it('should apply bearer token if request to api', async () => {
    const post = http.post('test/some', null).toPromise();
    controller.expectOne(req => req.headers.has('Authorization')).flush(null);
    await expectAsync(post).toBeResolved();
  });

  it('shouldn\'t apply bearer token if request not to api', async () => {
    const post = http.post('api/some', null).toPromise();
    controller.expectOne(req => !req.headers.has('Authorization')).flush(null);
    await expectAsync(post).toBeResolved();
  });
});
