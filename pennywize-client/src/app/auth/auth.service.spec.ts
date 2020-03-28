import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientModule, HttpParams, HttpClient } from '@angular/common/http';
import { authProviders } from './token-interceptor';
import { TokenData, IdClaims, DiscoveryDocument } from './interfaces';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { filter, first, tap, skip } from 'rxjs/operators';

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
          refreshAfter: 0.01,
          redirectUri: 'uri'
        })
      ]
    });

    service = TestBed.get(AuthService);
    controller = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save tokenData in localStorage', async () => {
    const state = 'test state';

    localStorage.setItem('state', state);
    localStorage.setItem('code_verifier', 'test verifier');

    const params = new HttpParams({ fromObject: { state } });

    const discoveryDocument: DiscoveryDocument = { token_endpoint: 'fake-token' };
    const getDiscoveryDocument = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve(discoveryDocument));

    const td: TokenData = {
      access_token: 'efgpispfj',
      id_token: 'fjsdipojfds',
      expires_in: '200',
      refresh_token: 'pofjesofjes',
      scope: 'email profile',
      token_type: 'token type'
    };

    const post = spyOn(http, 'post').and.returnValue(of(td));

    const request = service.validateStateAndRequestToken(params);
    await expectAsync(request).toBeResolved();

    expect(getDiscoveryDocument).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();

    const fromStorage = JSON.parse(localStorage.getItem('tokenData')) as TokenData;
    td.stored_at = fromStorage.stored_at;
    expect(fromStorage).toEqual(td);
  });

  it('should parse and notify id claims', async () => {
    const td: TokenData = {
      id_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
        'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    };

    let claims: IdClaims;
    const claimsPromise = service.idClaims
      .pipe(filter(c => !!c), first(), tap(c => claims = c))
      .toPromise();

    service.getStoredTokenData = () => td;
    service.setupTokenRefresh = async () => {};
    service.auth();

    await expectAsync(claimsPromise).toBeResolved();

    expect(claims).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022
    });
  });

  it('should throw if login fails', async () => {
    const claims = service.idClaims.toPromise();

    service.getStoredTokenData = () => ({ id_token: 'jsojdodjs' });
    service.setupTokenRefresh = async () => {};
    service.auth();

    await expectAsync(claims).toBeRejectedWith(new Error('Invalid id token payload'));
  });

  it('should request auth code', async () => {
    const getUrlParams = spyOn(service, 'getUrlParams').and.returnValue(new HttpParams({ fromString: '' }));
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
    spyOn(http, 'get').and.returnValue(of({}));

    const get = service.getDiscoveryDocument();
    await expectAsync(get).toBeResolved();
    expect(service.discoveryDocument).toBeTruthy();
  });

  it('should refresh token', async () => {
    service.getStoredTokenData = () => ({ refresh_token: 'refresh token' });
    service.setStoredTokenData = () => { };
    service.getDiscoveryDocument = () => Promise.resolve({ token_endpoint: 'endpoint' });
    service.setupTokenRefresh = () => Promise.resolve();
    service.auth();

    const post = spyOn(http, 'post').and.returnValue(of({ access_token: 'test' }));

    const td = service.tokenData
      .pipe(filter(e => !!e), skip(1), first())
      .toPromise();

    const refresh = service.refreshToken();

    await expectAsync(refresh).toBeResolved();
    await expectAsync(td).toBeResolvedTo({ access_token: 'test', stored_at: jasmine.anything() });
    expect(post).toHaveBeenCalled();
  });

  it('should throw if token data is missing', async () => {
    const refresh = service.refreshToken();
    await expectAsync(refresh).toBeRejectedWith(new Error('Missing tokenData'));
  });

  it('should handle token refresh error', async () => {
    service.getStoredTokenData = () => ({ refresh_token: 'refresh token' });
    service.setStoredTokenData = () => { };
    service.getDiscoveryDocument = () => Promise.resolve({ token_endpoint: 'endpoint' });
    service.setupTokenRefresh = () => Promise.resolve();
    service.auth();

    const get = spyOn(http, 'post').and.returnValue(throwError(new Error('test error')));
    const requestAuthorizationCode = spyOn(service, 'requestAuthorizationCode').and.returnValue(Promise.resolve());

    const refresh = service.refreshToken();

    await expectAsync(refresh).toBeResolved();
    expect(get).toHaveBeenCalled();
    expect(requestAuthorizationCode).toHaveBeenCalled();
  });

  it('should automatically refresh token after a while', async () => {
    jasmine.clock().install();
    const date = new Date();
    jasmine.clock().mockDate(date);

    const refreshToken = spyOn(service, 'refreshToken').and.returnValue(Promise.resolve());
    const setup = spyOn(service, 'setupTokenRefresh').and.callThrough();
    service.getStoredTokenData = () => ({ expires_in: '1' });
    service.auth();

    jasmine.clock().tick(10);

    expect(setup).toHaveBeenCalled();
    expect(refreshToken).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });

  it('should automatically refresh expired token', async () => {
    jasmine.clock().install();
    const date = new Date();
    jasmine.clock().mockDate(date);

    const refreshToken = spyOn(service, 'refreshToken').and.returnValue(Promise.resolve());
    const setup = spyOn(service, 'setupTokenRefresh').and.callThrough();
    service.getStoredTokenData = () => ({ expires_in: '1' });
    service.auth();

    jasmine.clock().tick(20);

    expect(setup).toHaveBeenCalled();
    expect(refreshToken).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });
});
