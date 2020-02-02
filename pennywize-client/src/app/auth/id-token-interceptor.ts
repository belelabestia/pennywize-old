import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Provider } from '@angular/core';
import { authConf } from './auth.conf';

export class IdTokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = this.auth.tokenData?.id_token;

    const tokenReq = req.url.startsWith(authConf.apiPath) && idToken ?
      req.clone({ setHeaders: { Authorization: `Bearer ${idToken}` } }) :
      req;

    return next.handle(tokenReq);
  }
}

export const idTokenInterceptorProviders: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: IdTokenInterceptor,
    multi: true,
    deps: [AuthService]
  }
];
