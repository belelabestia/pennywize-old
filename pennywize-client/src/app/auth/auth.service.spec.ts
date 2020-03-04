import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientModule, HttpParams, HttpClient } from '@angular/common/http';
import { authProviders } from './token-interceptor';
import { TokenData, IdClaims } from './interfaces';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;
  let controller: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [
        authProviders({
          issuer: 'testissuer',
          clientId: 'clientid',
          clientSecret: 'secret',
          scope: 'email',
          refreshAfter: 0.01
        })
      ]
    });

    service = TestBed.get(AuthService);
    controller = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
    localStorage.removeItem('tokenData');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save tokenData in localStorage', () => {
    const td: TokenData = {
      access_token: 'efgpispfj',
      id_token: 'fjsdipojfds',
      expires_in: '200',
      refresh_token: 'pofjesofjes',
      scope: 'email profile',
      token_type: 'token type'
    };

    service.tokenData = td;
    td.stored_at = service.tokenData.stored_at;

    const fromStorage = JSON.parse(localStorage.getItem('tokenData'));

    expect(fromStorage).toEqual(td);
  });

  it('should log user in', async () => {
    const td: TokenData = {
      access_token: 'efgpispfj',
      id_token: 'fjsdipojfds',
      expires_in: '200',
      refresh_token: 'pofjesofjes',
      scope: 'email profile',
      token_type: 'token type'
    };

    const setupTokenRefresh = spyOn(service, 'setupTokenRefresh');
    const logUserIn = spyOn(service, 'logUserIn');

    service.tokenData = td;

    await service.auth();

    expect(setupTokenRefresh).toHaveBeenCalled();
    expect(logUserIn).toHaveBeenCalled();
  });

  it('should parse and notify id claims', async () => {
    const td: TokenData = {
      id_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
        'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    };

    service.tokenData = td;

    let claims: IdClaims;
    const claimsPromise = service.idClaims
      .pipe(filter(c => !!c), first(), tap(c => claims = c))
      .toPromise();

    service.logUserIn();

    await expectAsync(claimsPromise).toBeResolved();
    expect(claims).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022
    });
  });

  it('should throw if login fails', () => {
    const td: TokenData = {
      id_token: 'jsojdodjs'
    };

    service.tokenData = td;
    const login = () => service.logUserIn();
    expect(login).toThrow();
  });

  it('should request auth code', async () => {
    const getUrlParams = spyOn(service, 'getUrlParams').and.callFake(() => new HttpParams({ fromString: '' }));
    const requestAuthorizationCode = spyOn(service, 'requestAuthorizationCode');

    await service.auth();

    expect(getUrlParams).toHaveBeenCalled();
    expect(requestAuthorizationCode).toHaveBeenCalled();
  });

  it('should request token', async () => {
    const params = new HttpParams({ fromString: 'code=1234' });
    const getUrlParams = spyOn(service, 'getUrlParams').and.callFake(() => params);
    const validateStateAndRequestToken = spyOn(service, 'validateStateAndRequestToken');

    await service.auth();

    expect(getUrlParams).toHaveBeenCalled();
    expect(validateStateAndRequestToken).toHaveBeenCalledWith(params);
  });

  it('should get discovery document', async () => {
    const get = service.getDiscoveryDocument();

    controller.expectOne(req =>
      req.method == 'GET' &&
      req.url == 'testissuer/.well-known/openid-configuration'
    ).flush({});

    await expectAsync(get).toBeResolved();
    expect(service.discoveryDocument).toBeTruthy();
  });

  it('should refresh token', async () => {
    const getDiscoveryDocument = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve({ token_endpoint: 'endpoint' }));

    const httpPost = spyOn(http, 'post').and.returnValue(of({}));
    const setupTokenRefresh = spyOn(service, 'setupTokenRefresh');
    service.tokenData = { refresh_token: 'refresh' };

    const refresh = service.refreshToken();

    await expectAsync(refresh).toBeResolved();
    expect(getDiscoveryDocument).toHaveBeenCalled();
    expect(httpPost).toHaveBeenCalled();
    expect(setupTokenRefresh).toHaveBeenCalled();
  });

  it('should handle token refresh error', async () => {
    const getDiscoveryDocument = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve({ token_endpoint: 'endpoint' }));

    const httpPost = spyOn(http, 'post').and.returnValue(throwError({}));
    const requestAuthorizationCode = spyOn(service, 'requestAuthorizationCode');
    const setupTokenRefresh = spyOn(service, 'setupTokenRefresh');
    service.tokenData = { refresh_token: 'refresh' };

    const refresh = service.refreshToken();

    await expectAsync(refresh).toBeResolved();
    expect(getDiscoveryDocument).toHaveBeenCalled();
    expect(httpPost).toHaveBeenCalled();
    expect(requestAuthorizationCode).toHaveBeenCalled();
    expect(setupTokenRefresh).not.toHaveBeenCalled();
  });

  it('should automatically refresh token after a while', async () => {
    jasmine.clock().install();
    const date = new Date();
    jasmine.clock().mockDate(date);

    service.tokenData = {
      expires_in: '1'
    };

    const refreshToken = spyOn(service, 'refreshToken').and.returnValue(Promise.resolve());
    const setup = service.setupTokenRefresh();

    jasmine.clock().tick(10);

    await expectAsync(setup).toBeResolved();
    expect(refreshToken).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });

  it('should automatically refresh expired token', async () => {
    jasmine.clock().install();
    const date = new Date();
    jasmine.clock().mockDate(date);

    service.tokenData = {
      expires_in: '1'
    };

    jasmine.clock().tick(20);

    const refreshToken = spyOn(service, 'refreshToken').and.returnValue(Promise.resolve());
    const setup = service.setupTokenRefresh();
    await expectAsync(setup).toBeResolved();
    expect(refreshToken).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });
});
