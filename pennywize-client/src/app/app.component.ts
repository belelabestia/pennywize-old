import { Component, OnInit, OnDestroy } from '@angular/core';
import { ErrorService } from './services/error.service';
import { Subscription } from 'rxjs';
import { OAuthService, JwksValidationHandler, OAuthStorage } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './services/auth-config';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  errorMessage: string;
  subscription: Subscription;

  constructor(
    private e: ErrorService,
    private a: AuthService,
  ) { }

  async ngOnInit() {
    this.subscription = this.e.error.subscribe(error => {
      this.errorMessage = error.message;
    });

    await this.a.initAuth();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dismissError() {
    this.errorMessage = null;
  }
}
