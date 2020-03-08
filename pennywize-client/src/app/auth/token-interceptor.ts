import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Provider, Inject } from '@angular/core';
import { TokenData, AuthConf, AUTH_CONF } from './interfaces';


export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, @Inject(AUTH_CONF) private conf: AuthConf) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = (this.auth.tokenData || {} as TokenData).id_token;

    const tokenReq = req.url.startsWith(this.conf.apiPath) && token ?
      req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) :
      req;

    return next.handle(tokenReq);
  }
}

export function authProviders(authConf: AuthConf): Provider[] {
  return [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
      deps: [AuthService, AUTH_CONF]
    },
    {
      provide: AUTH_CONF,
      useValue: authConf
    }
  ];
}
