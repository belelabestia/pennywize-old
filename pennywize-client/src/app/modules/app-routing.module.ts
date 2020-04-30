import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransactionsComponent } from '../components/transactions/transactions.component';
import { SettingsComponent } from '../components/settings/settings.component';
import { DownloadPersonalDataComponent } from '../components/download-personal-data/download-personal-data.component';
import { DeleteAccountComponent } from '../components/delete-account/delete-account.component';
import { PrivacyComponent } from '../components/privacy/privacy.component';
import { TermsAndConditionsComponent } from '../components/terms-and-conditions/terms-and-conditions.component';
import { ThirdPartyComponent } from '../components/third-party/third-party.component';

const routes: Routes = [
  {
    path: '',
    component: TransactionsComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 'settings/download-personal-data',
    component: DownloadPersonalDataComponent
  },
  {
    path: 'settings/delete-account',
    component: DeleteAccountComponent
  },
  {
    path: 'settings/privacy',
    component: PrivacyComponent
  },
  {
    path: 'settings/terms-and-conditions',
    component: TermsAndConditionsComponent
  },
  {
    path: 'settings/third-party',
    component: ThirdPartyComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
