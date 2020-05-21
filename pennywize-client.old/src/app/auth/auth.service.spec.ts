import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { HttpClientModule, HttpParams, HttpClient } from '@angular/common/http';
import { authProviders } from './token-interceptor';
import { TokenData, DiscoveryDocument, AuthConf } from './interfaces';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { filter, first, skip } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;
  let controller: HttpTestingController;
  let http: HttpClient;

  const conf: AuthConf = {
    issuer: 'testissuer',
    clientId: 'clientid',
    clientSecret: 'secret',
    scope: 'email',
    refreshAfter: 0.01,
    redirectUri: 'uri',
    responseType: 'responsetype',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule
      ],
      providers: [authProviders(conf)]
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
    const refresh = spyOn(service, 'setupTokenRefresh');

    const td: TokenData = {
      access_token: 'efgpispfj',
      id_token: 'fjsdipojfds',
      expires_in: '200',
      refresh_token: 'pofjesofjes',
      scope: 'email profile',
      token_type: 'token type'
    };

    const tdObs = service.tokenData
      .pipe(filter(e => !!e), first())
      .toPromise();

    service.setStoredTokenData(td);

    const storedTd = JSON.parse(localStorage.getItem('tokenData')) as TokenData;
    td.stored_at = storedTd.stored_at;

    await expectAsync(tdObs).toBeResolvedTo(td);
    expect(storedTd).toEqual(td);
    expect(refresh).toHaveBeenCalled();
  });

  it('should parse and notify id claims', async () => {
    const td: TokenData = {
      id_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
        'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    };

    const refresh = spyOn(service, 'setupTokenRefresh');

    const claims = service.idClaims
      .pipe(filter(e => !!e), first())
      .toPromise();

    service.setStoredTokenData(td);

    await expectAsync(claims).toBeResolvedTo({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022
    });

    expect(refresh).toHaveBeenCalled();
  });

  it('should throw if id_token parse fails', async () => {
    const td = { id_token: 'jsojdodjs' };
    const claims = service.idClaims.toPromise();

    const setupTokenRefresh = spyOn(service, 'setupTokenRefresh');

    service.setStoredTokenData(td);

    await expectAsync(claims).toBeRejectedWith(new Error('Invalid id token payload'));
    expect(setupTokenRefresh).toHaveBeenCalled();
  });

  it('should request auth code', async () => {
    const getUrlParams = spyOn(service, 'getUrlParams')
      .and.returnValue(new HttpParams({ fromString: '' }));

    const requestAuthorizationCode = spyOn(service, 'requestAuthorizationCode')
      .and.callThrough();

    const getDiscoveryDocument = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve({ authorization_endpoint: 'test_auth' }));

    const generateRandomString = spyOn(service, 'generateRandomString')
      .and.returnValue('test_random_string');

    const generateChallenge = spyOn(service, 'generateChallenge')
      .and.returnValue(Promise.resolve('test_challenge'));

    const navigateTo = spyOn(service, 'navigateTo');

    const authParams = new HttpParams({
      fromObject: {
        response_type: conf.responseType,
        client_id: conf.clientId,
        redirect_uri: conf.redirectUri,
        scope: conf.scope,
        state: 'test_random_string',
        code_challenge: 'test_challenge',
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent'
      }
    });

    await service.auth();

    expect(getUrlParams).toHaveBeenCalled();
    expect(requestAuthorizationCode).toHaveBeenCalled();

    expect(getDiscoveryDocument).toHaveBeenCalled();
    expect(generateRandomString).toHaveBeenCalled();
    expect(generateChallenge).toHaveBeenCalled();
    expect(navigateTo).toHaveBeenCalledWith(`test_auth?${authParams.toString()}`);
  });

  it('should request token', async () => {
    const params = new HttpParams({
      fromObject: {
        code: 'test_code',
        state: 'test_state'
      }
    });

    const td = { id_token: 'test_id_token' } as TokenData;

    const getUrlParams = spyOn(service, 'getUrlParams')
      .and.returnValue(params);

    const validateStateAndRequestToken = spyOn(service, 'validateStateAndRequestToken')
      .and.callThrough();

    const getDiscoveryDocument = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve({ token_endpoint: 'endpoint' }));

    const post = spyOn(http, 'post')
      .and.returnValue(of(td));

    const setStoredTokenData = spyOn(service, 'setStoredTokenData');

    localStorage.setItem('state', 'test_state');
    localStorage.setItem('code_verifier', 'test_verifier');

    await service.auth();

    expect(getUrlParams).toHaveBeenCalled();
    expect(validateStateAndRequestToken).toHaveBeenCalledWith(params);
    expect(getDiscoveryDocument).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
    expect(setStoredTokenData).toHaveBeenCalled();
  });

  it('should get discovery document', async () => {
    spyOn(http, 'get').and.returnValue(of({}));

    const get = service.getDiscoveryDocument();
    await expectAsync(get).toBeResolved();
    expect(service.discoveryDocument).toBeTruthy();
  });

  it('should refresh token', async () => {
    const td = { refresh_token: 'refresh token' } as TokenData;
    const dd = { token_endpoint: 'endpoint' } as DiscoveryDocument;

    const getDd = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve(dd));

    const post = spyOn(http, 'post').and.returnValue(of({ access_token: 'test' }));

    const setupTokenRefresh = spyOn(service, 'setupTokenRefresh');

    const tdObs = service.tokenData
      .pipe(filter(e => !!e), skip(1), first())
      .toPromise();

    service.setStoredTokenData(td);

    const refresh = service.refreshToken();

    await expectAsync(refresh).toBeResolved();

    await expectAsync(tdObs).toBeResolvedTo({
      refresh_token: 'refresh token',
      access_token: 'test',
      stored_at: jasmine.anything()
    });

    expect(getDd).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
    expect(setupTokenRefresh).toHaveBeenCalled();
  });

  it('should throw if token data is missing', async () => {
    const refresh = service.refreshToken();
    await expectAsync(refresh).toBeRejectedWith(new Error('Missing tokenData'));
  });

  it('should handle token refresh error', async () => {
    const td = {
      refresh_token: 'refresh'
    } as TokenData;

    const getStoredTokenData = spyOn(service, 'getStoredTokenData')
      .and.returnValue(td);

    const getDiscoveryDocument = spyOn(service, 'getDiscoveryDocument')
      .and.returnValue(Promise.resolve({ token_endpoint: 'endpoint' }));

    const post = spyOn(http, 'post').and.returnValue(throwError(new Error('test error')));

    const clearStoredTokenData = spyOn(service, 'clearStoredTokenData');

    const requestAuthorizationCode = spyOn(service, 'requestAuthorizationCode')
      .and.returnValue(Promise.resolve());

    const refresh = service.refreshToken();

    await expectAsync(refresh).toBeResolved();

    expect(getStoredTokenData).toHaveBeenCalled();
    expect(getDiscoveryDocument).toHaveBeenCalled();
    expect(post).toHaveBeenCalled();
    expect(clearStoredTokenData).toHaveBeenCalled();
    expect(requestAuthorizationCode).toHaveBeenCalled();
  });

  it('should automatically refresh token after a while', () => {
    jasmine.clock().install();
    const date = new Date();
    jasmine.clock().mockDate(date);

    const td = { expires_in: '1' } as TokenData;

    const getStoredTokenData = spyOn(service, 'getStoredTokenData')
      .and.returnValue(td);

    const refreshToken = spyOn(service, 'refreshToken');

    service.setupTokenRefresh();

    jasmine.clock().tick(10);

    expect(getStoredTokenData).toHaveBeenCalled();
    expect(refreshToken).toHaveBeenCalled();

    jasmine.clock().uninstall();
  });

  it('should immediately refresh expired token', async () => {
    const td = { expires_in: '1', stored_at: '0' } as TokenData;

    const getStoredTokenData = spyOn(service, 'getStoredTokenData')
      .and.returnValue(td);

    const refreshToken = spyOn(service, 'refreshToken')
      .and.returnValue(new Promise(resolve => {
        service.setStoredTokenData({ id_token: 'token' });
        resolve();
      }));

    const token = service.tokenData.pipe(first()).toPromise();

    const setup = service.setupTokenRefresh();

    await expectAsync(setup).toBeResolved();
    await expectAsync(token).toBeResolved();
    expect(getStoredTokenData).toHaveBeenCalled();
    expect(refreshToken).toHaveBeenCalled();
  });
});
