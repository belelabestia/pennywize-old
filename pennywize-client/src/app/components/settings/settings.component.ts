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
    return { 'background-image': `url(${this.claims.picture})` };
  }

  constructor(private a: AuthService) { }

  ngOnInit() {
    this.sub = this.a.idClaims.subscribe(c => { this.claims = c; });
  }

  logout() {
    // TODO are you sure popup
    // TODO create logout method in auth service
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
