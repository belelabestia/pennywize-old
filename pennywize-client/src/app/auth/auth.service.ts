import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { DiscoveryDocument, TokenResponse } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly issuer = 'https://accounts.google.com';
  readonly responseType = 'code';
  readonly clientId = '748180026787-gnbgs0f358t6qq5v9ph8aanovq39pkee.apps.googleusercontent.com';
  readonly redirectUri = location.origin;
  readonly scope = 'openid profile email';
  readonly clientSecret = 'cu8MxCD_1XrTSNucofF26_gQ';

  discoveryDocument: DiscoveryDocument;
  tokenResponse: TokenResponse;

  constructor(private http: HttpClient) { }

  async auth() {
    const urlParams = new HttpParams({ fromString: location.search.slice(1) });
    const authorizationCode = urlParams.get('code');

    if (!authorizationCode) {
      await this.requestAuthorizationCode();
    } else {
      await this.requestToken(authorizationCode);
    }
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

    const authorizationParams = new HttpParams({
      fromObject: {
        response_type: this.responseType,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: this.scope
      }
    });

    location.href = `${authorizationEndpoint}?${authorizationParams.toString()}`;
  }

  async requestToken(authorizationCode: string) {
    history.replaceState({}, '', '');

    const discoveryDocument = await this.getDiscoveryDocument();
    const tokenEndpoint = discoveryDocument.token_endpoint;

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
}

/*
- Usare il token in un interceptor
- Salvare/recuperare il token in/da localStorage
- Gestire parametro State
*/
