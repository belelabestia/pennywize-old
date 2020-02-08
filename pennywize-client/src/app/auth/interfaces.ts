export interface AuthConf {
  issuer: string;
  responseType: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  clientSecret: string;
  apiPath: string;
  refreshAfter?: number;
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

export interface IdClaims {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  auth_time: number;
  nonce: string;
  acr: string;
  amr: string[];
  azp: string;
  name: string;
  given_name: string;
  family_name: string;
  middle_name: string;
  nickname: string;
  preferred_username: string;
  profile: string;
  picture: string;
  website: string;
  email: string;
  email_verified: boolean;
  gender: string;
  birthdate: string;
  zoneinfo: string;
  locale: string;
  phone_number: string;
  phone_number_verified: boolean;
  address: AddressClaim;
  updated_at: number;
}

export interface AddressClaim {
  formatted: string;
  street_address: string;
  locality: string;
  region: string;
  postal_code: string;
  country: string;
}
