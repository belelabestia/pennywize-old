import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransactionsComponent } from '../components/transactions/transactions.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { DownloadPersonalDataComponent } from '../components/download-personal-data/download-personal-data.component';
import { DeleteAccountComponent } from '../components/delete-account/delete-account.component';
import { PrivacyComponent } from '../components/legal/privacy/privacy.component';
import { TermsAndConditionsComponent } from '../components/legal/terms-and-conditions/terms-and-conditions.component';
import { ThirdPartyComponent } from '../components/third-party/third-party.component';
import { HomeComponent } from '../components/home/home.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: 'transactions',
    component: TransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings/download-personal-data',
    component: DownloadPersonalDataComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings/delete-account',
    component: DeleteAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'privacy',
    component: PrivacyComponent
  },
  {
    path: 'terms-and-conditions',
    component: TermsAndConditionsComponent
  },
  {
    path: 'third-party',
    component: ThirdPartyComponent
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
