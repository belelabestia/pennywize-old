import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  errorMessage: string;
  subscription = new Subscription();
  logging = true;

  constructor(private a: AuthService) { }

  async ngOnInit() {
    await this.a.auth();
    this.logging = false;
  }
}
