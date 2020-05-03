import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  loading = true;

  constructor(
    private a: AuthService,
    private r: Router,
    private cd: ChangeDetectorRef,
    ) { }

  async ngOnInit() {
    await this.a.init();
    this.cd.markForCheck();
    this.loading = false;

    const claims = await this.a.idClaims.pipe(first()).toPromise();
    if (claims) this.r.navigateByUrl('/transactions');
  }

  login() { this.a.login(); }
}
