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
  logging: boolean;

  constructor(
    private e: ErrorService,
    private a: AuthService
  ) { }

  async ngOnInit() {
    this.subscription = this.e.error.subscribe(error => {
      this.errorMessage = error.message;
    });

    this.logging = true;
    await this.a.auth();
    this.logging = false;
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
