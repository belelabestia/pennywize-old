import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private a: AuthService, private r: Router) { }

  async canActivate(): Promise<boolean> {
    const success = await this.a.auth()
      .justLogged(({ stop }) => stop())
      .go();

    if (!success) this.r.navigateByUrl('/');

    return success;
  }
}
