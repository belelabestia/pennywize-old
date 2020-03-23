import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DiscoveryDocument, TokenData, AuthConf, IdClaims, AUTH_CONF } from './interfaces';
import { timer, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  discoveryDocument: DiscoveryDocument;
  private tokenDataSub = new BehaviorSubject<TokenData>(null);

  readonly tokenData = this.tokenDataSub
    .asObservable()
    .pipe(tap(td => {
      if (td) {
        td.stored_at = '' + new Date().getTime();
      }
    }));

  readonly idClaims = this.tokenData.pipe(map(td => this.getIdClaims(td)));

  constructor(
    private http: HttpClient,
    @Inject(AUTH_CONF) private authConf: AuthConf
  ) {
    this.tokenData.subscribe(td => {
      if (td) {
        this.setStoredTokenData(td);
        this.setupTokenRefresh();
      }
    });
  }

  async auth(): Promise<void> {
    const tokenData = this.getStoredTokenData();
    const urlParams = this.getUrlParams();
    if (tokenData) {
      this.tokenDataSub.next(tokenData);
      return;
    }

    const authorizationCode = urlParams.get('code');

    const action = authorizationCode ?
      () => this.validateStateAndRequestToken(urlParams) :
      () => this.requestAuthorizationCode();

    await action();
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
    this.navigateTo(url);
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
    this.tokenDataSub.next(tokenData);
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

  getStoredTokenData() {
    return JSON.parse(localStorage.getItem('tokenData')) as TokenData;
  }

  setStoredTokenData(td: TokenData) {
    td = { ...this.getStoredTokenData(), ...td };
    localStorage.setItem('tokenData', JSON.stringify(td));
  }

  clearStoredTokenData() {
    localStorage.removeItem('tokenData');
  }

  async refreshToken(): Promise<void> {
    let tokenData = this.tokenDataSub.value;

    if (!tokenData) {
      throw new Error('Missing tokenData');
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
      this.tokenDataSub.next(tokenData);
    } catch {
      this.clearStoredTokenData();
      await this.requestAuthorizationCode();
    }
  }

  async setupTokenRefresh(): Promise<void> {
    const tokenData = this.tokenDataSub.value;

    if (!this.authConf.refreshAfter || !(tokenData || {} as TokenData).expires_in) {
      throw new Error('Missing refresh data');
    }

    const storedAt = +tokenData.stored_at;
    const expiresIn = +tokenData.expires_in * 1000;
    const refreshAfter = expiresIn * this.authConf.refreshAfter;
    const refreshAt = storedAt + refreshAfter;
    const now = new Date().getTime();
    const refreshIn = refreshAt - now;

    if (refreshIn <= 0) {
      await this.refreshToken();
      return;
    }

    timer(refreshIn).subscribe(async () => {
      await this.refreshToken();
    });
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

  navigateTo(url: string): void {
    location.href = url;
  }

  getUrlParams(): HttpParams {
    const params = new HttpParams({ fromString: location.search.slice(1) });
    history.replaceState({}, '', '');
    return params;
  }
}
