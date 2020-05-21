import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './modules/app-routing.module';
import { AppComponent } from './app.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { TransactionComponent } from './components/transactions/transaction/transaction.component';
import { HttpClientModule } from '@angular/common/http';
import { EditTransactionComponent } from './components/transactions/edit-transaction/edit-transaction.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material.module';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { authProviders } from './auth/token-interceptor';
import { authConf } from './auth/auth.conf';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ErrorComponent } from './components/error/error.component';
import { PrivacyComponent } from './components/legal/privacy/privacy.component';
import { TermsAndConditionsComponent } from './components/legal/terms-and-conditions/terms-and-conditions.component';
import { ThirdPartyComponent } from './components/third-party/third-party.component';
import { HomeComponent } from './components/home/home.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

registerLocaleData(localeIt);

@NgModule({
  declarations: [
    AppComponent,
    TransactionComponent,
    TransactionsComponent,
    EditTransactionComponent,
    SettingsComponent,
    ProfileComponent,
    ErrorComponent,
    PrivacyComponent,
    TermsAndConditionsComponent,
    ThirdPartyComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    authProviders(authConf),
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule { }
