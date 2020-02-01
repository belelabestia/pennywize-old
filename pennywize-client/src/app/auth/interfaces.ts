export interface AuthConf {
  issuer: string;
  responseType: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  clientSecret: string;
  apiPath: string;
}

export interface DiscoveryDocument {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;

  [key: string]: string;
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in?: string;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
  stored_at?: string;

  [key: string]: string;
}
