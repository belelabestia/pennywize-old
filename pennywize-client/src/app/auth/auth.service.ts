import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DiscoveryDocument, TokenResponse } from './interfaces';
import { authConf } from './auth.conf';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly issuer = authConf.issuer;
  readonly responseType = authConf.responseType;
  readonly clientId = authConf.clientId;
  readonly redirectUri = authConf.redirectUri;
  readonly scope = authConf.scope;
  readonly clientSecret = authConf.clientSecret;

  discoveryDocument: DiscoveryDocument;
  tokenResponse: TokenResponse;

  constructor(private http: HttpClient) { }

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
    if (!this.discoveryDocument) {
      this.discoveryDocument = await this.http.get<DiscoveryDocument>(`${this.issuer}/.well-known/openid-configuration`).toPromise();
    }

    return this.discoveryDocument;
  }

  async requestAuthorizationCode() {
    const discoveryDocument = await this.getDiscoveryDocument();
    const authorizationEndpoint = discoveryDocument.authorization_endpoint;

    const state = this.generateStateParameter();
    localStorage.setItem('state', state);

    const authorizationParams = new HttpParams({
      fromObject: {
        response_type: this.responseType,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: this.scope,
        state
      }
    });

    location.href = `${authorizationEndpoint}?${authorizationParams.toString()}`;
  }

  async validateStateAndRequestToken(urlParams: HttpParams) {
    const urlState = urlParams.get('state');
    const storedState = localStorage.getItem('state');

    if (urlState != storedState) {
      throw new Error('OAuth state parameter doesn\'t match');
    }

    const discoveryDocument = await this.getDiscoveryDocument();
    const tokenEndpoint = discoveryDocument.token_endpoint;

    const authorizationCode = urlParams.get('code');

    const postData = new FormData();
    postData.append('grant_type', 'authorization_code');
    postData.append('code', authorizationCode);
    postData.append('redirect_uri', this.redirectUri);
    postData.append('client_id', this.clientId);
    postData.append('client_secret', this.clientSecret);

    this.tokenResponse = await this.http.post<any>(`${tokenEndpoint}`, postData).toPromise();
  }

  async getUserInfo() {
    const discoveryDocument = await this.getDiscoveryDocument();
    const userInfoEndpoint = discoveryDocument.userinfo_endpoint;
    const accessToken = this.tokenResponse.access_token;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });

    return await this.http.get(userInfoEndpoint, { headers }).toPromise();
  }

  private generateStateParameter(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const byteArray = new Uint8Array(128);

    crypto.getRandomValues(byteArray);

    const someArray = byteArray.map(b => chars.charCodeAt(b % chars.length));

    return String.fromCharCode(...someArray);
  }
}

/*
- implementare PKCE
- Salvare/recuperare il token in/da localStorage
*/
