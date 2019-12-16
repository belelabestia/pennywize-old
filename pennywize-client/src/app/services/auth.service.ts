import { Injectable } from '@angular/core';
import { OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private oa: OAuthService) { }

  async initAuth() {
    const email = localStorage.getItem('email');

    if (email) {
      authCodeFlowConfig.customQueryParams = { login_hint: email };
    }

    this.oa.configure(authCodeFlowConfig);
    this.oa.tokenValidationHandler = new JwksValidationHandler();
    this.oa.setupAutomaticSilentRefresh();

    await this.oa.loadDiscoveryDocumentAndTryLogin();

    if (
      !this.oa.hasValidIdToken() ||
      !this.oa.hasValidAccessToken()
    ) {
      this.oa.initCodeFlow();
    }
  }
}
