import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Provider } from '@angular/core';

export class IdTokenInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const idToken = (this.auth.tokenResponse || {} as any).id_token;

    const tokenReq = idToken ?
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
