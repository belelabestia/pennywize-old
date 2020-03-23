import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Provider, Inject } from '@angular/core';
import { AuthConf, AUTH_CONF } from './interfaces';
import { switchMap, first } from 'rxjs/operators';


export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, @Inject(AUTH_CONF) private conf: AuthConf) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.auth.tokenData.pipe(first(), switchMap(td => {
      const tokenReq = req.url.startsWith(this.conf.apiPath) && td.id_token ?
        req.clone({ setHeaders: { Authorization: `Bearer ${td.id_token}` } }) :
        req;

      return next.handle(tokenReq);
    }));
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
