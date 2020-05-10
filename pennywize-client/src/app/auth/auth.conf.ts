import { AuthConf } from './interfaces';

export const authConf: AuthConf = {
  issuer: 'https://accounts.google.com',
  responseType: 'code',
  clientId: '748180026787-gnbgs0f358t6qq5v9ph8aanovq39pkee.apps.googleusercontent.com',
  redirectUri: location.origin,
  scope: 'openid profile email',
  clientSecret: 'H5DIRTbc0vRD-JGp2Le0a2Z0',
  apiPath: 'api/',
  refreshAfter: 0.8
};
