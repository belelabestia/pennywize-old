import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { IdClaims } from 'src/app/auth/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  claims: IdClaims;
  sub: Subscription;

  get profile() {
    return {
      background: `#0000 url('${this.claims.picture})'`,
      backgroundSize: 'contain'
    };
  }

  constructor(private a: AuthService) { }

  ngOnInit() {
    this.sub = this.a.idClaims.subscribe(c => { this.claims = c; });
  }

  logout() {
    this.a.logout();
    this.a.auth();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
