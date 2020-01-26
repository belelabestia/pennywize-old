import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DiscoveryDocument, TokenResponse, AuthConf } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authConf: AuthConf;
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
      this.discoveryDocument = await this.http
        .get<DiscoveryDocument>(`${this.authConf.issuer}/.well-known/openid-configuration`)
        .toPromise();
    }

    return this.discoveryDocument;
  }

  async requestAuthorizationCode() {
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
        code_challenge_method: 'S256'
      }
    });

    location.href = `${authorizationEndpoint}?${authorizationParams.toString()}`;
  }

  async validateStateAndRequestToken(urlParams: HttpParams) {
    const urlState = urlParams.get('state');
    const storedState = localStorage.getItem('state');
    const storedVerifier = localStorage.getItem('code_verifier');

    if (urlState != storedState) {
      throw new Error('OAuth state parameter doesn\'t match');
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

/*
- Salvare/recuperare il token in/da localStorage
- Refresh token
*/
