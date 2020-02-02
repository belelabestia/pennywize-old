import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Provider } from '@angular/core';
import { authConf } from './auth.conf';
import { TokenData } from './interfaces';

export class TokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = (this.auth.tokenData || {} as TokenData).id_token;

    const tokenReq = req.url.startsWith(authConf.apiPath) && token ?
      req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) :
      req;

    return next.handle(tokenReq);
  }
}

export const tokenInterceptorProviders: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true,
    deps: [AuthService]
  }
];
