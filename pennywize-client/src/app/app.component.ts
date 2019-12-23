import { Component, OnInit, OnDestroy } from '@angular/core';
import { ErrorService } from './services/error.service';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  errorMessage: string;
  subscription: Subscription;

  get logged() {
    return !!this.a.tokenResponse;
  }

  constructor(
    private e: ErrorService,
    private a: AuthService
  ) { }

  async ngOnInit() {
    this.subscription = this.e.error.subscribe(error => {
      this.errorMessage = error.message;
    });

    await this.a.auth();
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
