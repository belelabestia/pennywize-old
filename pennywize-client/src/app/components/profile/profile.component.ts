import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { IdClaims } from 'src/app/auth/interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit, OnDestroy {
  claims: IdClaims;
  sub = new Subscription();

  get profile() {
    return {
      background: `#0000 url('${(this.claims || {}).picture || ''}')`,
      backgroundSize: 'contain'
    };
  }

  constructor(private a: AuthService) { }

  ngOnInit() {
    const sub = this.a.idClaims.subscribe(c => this.claims = c);
    this.sub.add(sub);
  }

  ngOnDestroy() { this.sub.unsubscribe(); }
}
