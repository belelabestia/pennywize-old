import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DiscoveryDocument, TokenResponse as TokenData, AuthConf } from './interfaces';

const authConfErrorMessage = 'Configuration object missing; must call AuthService.configure() method before the AuthService.auth() method.';
const stateMismatchMessage = 'OAuth state parameter doesn\'t match';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authConf: AuthConf;
  discoveryDocument: DiscoveryDocument;

  get tokenData() {
    return JSON.parse(localStorage.getItem('tokenData'));
  }

  set tokenData(tr: TokenData) {
    localStorage.setItem('tokenData', JSON.stringify(tr));
  }

  constructor(private http: HttpClient) { }

  configure(conf: AuthConf) {
    this.authConf = conf;
  }

  async auth() {
    const urlParams = new HttpParams({ fromString: location.search.slice(1) });
    history.replaceState({}, '', '');

    const authorizationCode = urlParams.get('code');

    const operation = authorizationCode ?
      () => this.validateStateAndRequestToken(urlParams) :
      () => this.requestAuthorizationCode();

    await operation();
  }

  async getDiscoveryDocument() {
    if (!this.authConf) {
      throw new Error(authConfErrorMessage);
    }

    if (!this.discoveryDocument) {
      this.discoveryDocument = await this.http
        .get<DiscoveryDocument>(`${this.authConf.issuer}/.well-known/openid-configuration`)
        .toPromise();
    }

    return this.discoveryDocument;
  }

  async requestAuthorizationCode() {
    if (!this.authConf) {
      throw new Error(authConfErrorMessage);
    }

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

    location.href = `${authorizationEndpoint}?${authorizationParams.toString()}`;
  }

  async validateStateAndRequestToken(urlParams: HttpParams) {
    if (!this.authConf) {
      throw new Error(authConfErrorMessage);
    }

    const urlState = urlParams.get('state');
    const storedState = localStorage.getItem('state');
    const storedVerifier = localStorage.getItem('code_verifier');

    if (urlState != storedState) {
      throw new Error(stateMismatchMessage);
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

    this.tokenData = await this.http.post<any>(`${tokenEndpoint}`, postData).toPromise();
  }

  async getUserInfo() {
    const discoveryDocument = await this.getDiscoveryDocument();
    const userInfoEndpoint = discoveryDocument.userinfo_endpoint;
    const accessToken = this.tokenData.access_token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });

    return await this.http.get(userInfoEndpoint, { headers }).toPromise();
  }

  async refreshToken() {
    const discoveryDocument = await this.getDiscoveryDocument();
    const tokenEndpoint = discoveryDocument.token_endpoint;

    const postData = new FormData();
    postData.append('grant_type', 'refresh_token');
    postData.append('client_id', this.authConf.clientId);
    postData.append('client_secret', this.authConf.clientSecret);
    postData.append('refresh_token', this.tokenData.refresh_token);
    postData.append('scope', this.authConf.scope);

    const tokenData = await this.http.post<any>(`${tokenEndpoint}`, postData).toPromise();
    tokenData.refresh_token = this.tokenData.refresh_token;

    this.tokenData = tokenData;
  }

  private generateRandomString(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const byteArray = new Uint8Array(128);

    crypto.getRandomValues(byteArray);

    const someArray = byteArray.map(b => chars.charCodeAt(b % chars.length));

    return String.fromCharCode(...someArray);
  }

  private async generateChallenge(code: string): Promise<string> {
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
}
