import { Component, OnInit, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { ErrorService } from './services/error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  errorMessage: string;
  subscription: Subscription;

  constructor(private e: ErrorService) { }

  ngOnInit() {
    this.subscription = this.e.error.subscribe(error => { this.errorMessage = error.message; });
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
