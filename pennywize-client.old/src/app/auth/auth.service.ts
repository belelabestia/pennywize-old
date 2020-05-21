import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DiscoveryDocument, TokenData, AuthConf, IdClaims, AUTH_CONF } from './interfaces';
import { timer, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  discoveryDocument: DiscoveryDocument;
  private tokenDataSub = new BehaviorSubject<TokenData>(undefined);
  private idClaimsSub = new BehaviorSubject<IdClaims>(undefined);

  readonly tokenData = this.tokenDataSub.asObservable();
  readonly idClaims = this.idClaimsSub.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(AUTH_CONF) private authConf: AuthConf
  ) { }

  auth(): AuthPromise {
    return new AuthPromise(async (already, just, stop) => {
      if (this.getStoredTokenData()) {
        await this.setupTokenRefresh();
        await already(true);
        return;
      }

      await already(false);
      if (stop()) return;

      const urlParams = this.getUrlParams();
      const authorizationCode = urlParams.get('code');

      if (authorizationCode) {
        await this.validateStateAndRequestToken(urlParams);
        await just(true);
        return;
      }

      await just(false);
      if (stop()) return;

      await this.requestAuthorizationCode();
    });
  }

  async getDiscoveryDocument(): Promise<DiscoveryDocument> {
    if (!this.discoveryDocument) {
      this.discoveryDocument = await this.http
        .get<DiscoveryDocument>(`${this.authConf.issuer}/.well-known/openid-configuration`)
        .toPromise();
    }

    return this.discoveryDocument;
  }

  async requestAuthorizationCode(): Promise<void> {
    const discoveryDocument = await this.getDiscoveryDocument();
    const authorizationEndpoint = discoveryDocument.authorization_endpoint;

    const state = this.generateRandomString();
    localStorage.setItem('state', state);

    const verifier = this.generateRandomString();
    localStorage.setItem('code_verifier', verifier);

    const challenge = await this.generateChallenge(verifier);

    const authorizationParams = new HttpParams({
      fromObject: {
        response_type: this.authConf.responseType,
        client_id: this.authConf.clientId,
        redirect_uri: this.authConf.redirectUri,
        scope: this.authConf.scope,
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        access_type: 'offline',
        prompt: 'consent'
      }
    });

    const url = `${authorizationEndpoint}?${authorizationParams.toString()}`;
    await this.navigateTo(url);
  }

  async validateStateAndRequestToken(urlParams: HttpParams): Promise<void> {
    const urlState = urlParams.get('state');
    const storedState = localStorage.getItem('state');
    const storedVerifier = localStorage.getItem('code_verifier');

    if (urlState != storedState) {
      throw new Error('State parameter doesn\'t match');
    }

    const discoveryDocument = await this.getDiscoveryDocument();
    const tokenEndpoint = discoveryDocument.token_endpoint;

    const authorizationCode = urlParams.get('code');

    const postData = new FormData();
    postData.append('grant_type', 'authorization_code');
    postData.append('code', authorizationCode);
    postData.append('redirect_uri', this.authConf.redirectUri);
    postData.append('client_id', this.authConf.clientId);
    postData.append('client_secret', this.authConf.clientSecret);
    postData.append('code_verifier', storedVerifier);

    const tokenData = await this.http.post<TokenData>(tokenEndpoint, postData).toPromise();
    this.setStoredTokenData(tokenData);
  }

  logout() {
    this.clearStoredAuthData();
  }

  getIdClaims(tokenData: TokenData): IdClaims {
    if (!tokenData || !tokenData.id_token) {
      return null;
    }

    let payload: string | IdClaims = tokenData.id_token.split('.')[1];

    if (!payload) {
      throw new Error('Invalid id token payload');
    }

    payload = atob(payload);
    payload = JSON.parse(payload) as IdClaims;

    return payload;
  }

  getStoredTokenData(): TokenData {
    if (!this.tokenDataSub.value) {
      const td = JSON.parse(localStorage.getItem('token_data')) as TokenData;
      this.tokenDataSub.next(td);
    }

    this.getStoredIdClaims();

    return this.tokenDataSub.value;
  }

  getStoredIdClaims(): IdClaims {
    if (!this.idClaimsSub.value) {
      const claims = JSON.parse(localStorage.getItem('id_claims')) as IdClaims;
      this.idClaimsSub.next(claims);
    }

    return this.idClaimsSub.value;
  }

  setStoredTokenData(td: TokenData): void {
    td = {
      ...this.getStoredTokenData(),
      ...td,
      stored_at: new Date().getTime()
    };

    this.setStoredIdClaims(td);

    this.tokenDataSub.next(td);
    localStorage.setItem('token_data', JSON.stringify(td));

    this.setupTokenRefresh();
  }

  setStoredIdClaims(td: TokenData) {
    const claims = {
      ...this.getStoredIdClaims(),
      ...this.getIdClaims(td),
    };

    this.idClaimsSub.next(claims);
    localStorage.setItem('id_claims', JSON.stringify(claims));
  }

  clearStoredAuthData(): void {
    this.tokenDataSub.next(null);
    this.idClaimsSub.next(null);

    localStorage.removeItem('token_data');
    localStorage.removeItem('code_verifier');
    localStorage.removeItem('state');
    localStorage.removeItem('id_claims');
  }

  async refreshToken(): Promise<void> {
    let tokenData = this.getStoredTokenData();

    if (!tokenData) {
      throw new Error('Missing token_data');
    }

    const discoveryDocument = await this.getDiscoveryDocument();
    const tokenEndpoint = discoveryDocument.token_endpoint;

    const postData = new FormData();
    postData.append('grant_type', 'refresh_token');
    postData.append('client_id', this.authConf.clientId);
    postData.append('client_secret', this.authConf.clientSecret);
    postData.append('refresh_token', tokenData.refresh_token);
    postData.append('scope', this.authConf.scope);

    try {
      tokenData = await this.http.post<TokenData>(tokenEndpoint, postData).toPromise();
      this.setStoredTokenData(tokenData);
    } catch {
      this.clearStoredAuthData();
      await this.requestAuthorizationCode();
    }
  }

  async setupTokenRefresh(): Promise<void> {
    const tokenData = this.getStoredTokenData();

    if (!this.authConf.refreshAfter || !(tokenData || {} as TokenData).expires_in) {
      throw new Error('Missing refresh data');
    }

    const storedAt = tokenData.stored_at;
    const expiresIn = +tokenData.expires_in * 1000;
    const refreshAfter = expiresIn * this.authConf.refreshAfter;
    const refreshAt = storedAt + refreshAfter;
    const now = new Date().getTime();
    const refreshIn = refreshAt - now;

    if (refreshIn <= 0) {
      await this.refreshToken();
      return;
    }

    timer(refreshIn).subscribe(() => this.refreshToken());
  }

  generateRandomString(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const byteArray = new Uint8Array(128);

    crypto.getRandomValues(byteArray);

    const someArray = byteArray.map(b => chars.charCodeAt(b % chars.length));

    return String.fromCharCode(...someArray);
  }

  async generateChallenge(code: string): Promise<string> {
    let data: any = new TextEncoder().encode(code);

    data = await crypto.subtle.digest('SHA-256', data);
    data = new Uint8Array(data);
    data = String.fromCharCode(...data);

    data = btoa(data)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return data;
  }

  async navigateTo(url: string): Promise<void> {
    await new Promise(() => location.href = url);
  }

  getUrlParams(): HttpParams {
    const params = new HttpParams({ fromString: location.search.slice(1) });
    history.replaceState(null, window.name, location.pathname);
    return params;
  }
}

type AuthPromiseCallback = (
  already: (success: boolean) => Promise<void>,
  just: (success: boolean) => Promise<void>,
  stop: () => boolean
) => Promise<void>;

type AuthPromiseLoginCallback = (param: { success: boolean, stop: () => void }) => any | Promise<any>;

export class AuthPromise {
  private alreadyCallback: AuthPromiseLoginCallback;
  private justCallback: AuthPromiseLoginCallback;
  private stop = false;
  private result = false;

  constructor(private callback: AuthPromiseCallback) { }

  alreadyLogged(callback: AuthPromiseLoginCallback): this {
    this.alreadyCallback = callback;
    return this;
  }

  justLogged(callback: AuthPromiseLoginCallback): this {
    this.justCallback = callback;
    return this;
  }

  async go(): Promise<boolean> {
    await this.callback(
      success => this.invokeAlready(success),
      success => this.invokeJust(success),
      () => this.stop
    );

    return this.result;
  }

  private async invokeAlready(success: boolean): Promise<void> {
    if (this.alreadyCallback) await this.alreadyCallback({ success, stop: () => this.stop = true });
    this.result = success;
  }

  private async invokeJust(success: boolean): Promise<void> {
    if (this.justCallback) await this.justCallback({ success, stop: () => this.stop = true });
    this.result = success;
  }
}
