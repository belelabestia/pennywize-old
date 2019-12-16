import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  redirectUri: location.origin,
  clientId: '748180026787-gnbgs0f358t6qq5v9ph8aanovq39pkee.apps.googleusercontent.com',
  dummyClientSecret: 'cu8MxCD_1XrTSNucofF26_gQ',
  responseType: 'code',
  scope: 'openid profile email',
  strictDiscoveryDocumentValidation: false
};
