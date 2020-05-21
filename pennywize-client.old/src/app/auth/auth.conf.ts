import { AuthConf } from './interfaces';
import { environment } from 'src/environments/environment';

export const authConf: AuthConf = {
  issuer: 'https://accounts.google.com',
  responseType: 'code',
  clientId: '748180026787-gnbgs0f358t6qq5v9ph8aanovq39pkee.apps.googleusercontent.com',
  redirectUri: environment.production ? 'https://pwz.belelabestia.it' : 'http://localhost:4200',
  scope: 'openid profile email',
  clientSecret: 'H5DIRTbc0vRD-JGp2Le0a2Z0',
  apiPath: 'api/',
  refreshAfter: 0.8
};
