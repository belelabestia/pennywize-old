import { Component, ChangeDetectionStrategy, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  @ViewChild('deleteDialog', { static: true }) deleteDialog: TemplateRef<any>;
  @ViewChild('accountDeletedDialog', { static: true }) accountDeletedDialog: TemplateRef<any>;
  loading = false;

  constructor(
    private a: AuthService,
    private r: Router,
    private d: MatDialog,
    private h: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  logout() {
    this.a.logout();
    this.r.navigateByUrl('/home');
  }

  async deleteAccount() {
    const result = await this.d.open(this.deleteDialog).afterClosed().toPromise();

    if (!result) return;

    this.loading = true;
    this.cd.markForCheck();

    await this.h.delete('api/userdata').toPromise();
    await this.d.open(this.accountDeletedDialog).afterClosed().toPromise();
    this.logout();
  }
}
