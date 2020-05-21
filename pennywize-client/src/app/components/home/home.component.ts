import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';

type UserRegistration = { alreadyRegistered: true } | { justRegistered: true };

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  @ViewChild('welcome') welcome: TemplateRef<any>;
  loading = true;
  welcomeName: string;

  constructor(
    private a: AuthService,
    private r: Router,
    private cd: ChangeDetectorRef,
    private h: HttpClient,
    private d: MatDialog
  ) { }

  async ngOnInit() {
    await this.a.auth()
      .alreadyLogged(({ success }) => {
        if (success) this.r.navigateByUrl('/transactions');
      })
      .justLogged(async ({ success, stop }) => {
        stop();
        if (!success) return;

        if (await this.tryRegisterUser()) {
          const claims = await this.a.idClaims.pipe(first()).toPromise();
          this.welcomeName = claims.given_name;

          await this.d.open(this.welcome, { width: '70%', height: '70%' })
            .afterClosed()
            .toPromise();
        }

        this.r.navigateByUrl('/transactions');
      })
      .go();

    this.cd.markForCheck();
    this.loading = false;
  }

  login() { this.a.auth().go(); }

  async tryRegisterUser(): Promise<boolean> {
    const result = await this.h.post<UserRegistration>('api/userdata', null).toPromise();
    return 'justRegistered' in result;
  }
}
