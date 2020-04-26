import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { IdClaims } from 'src/app/auth/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  constructor(private a: AuthService) { }

  logout() {
    this.a.logout();
    this.a.auth();
  }
}
