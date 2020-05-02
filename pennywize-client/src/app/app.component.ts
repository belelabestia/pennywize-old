import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  state: State = State.Loading;

  get loading() { return this.state == State.Loading; }
  get logged() { return this.state == State.Logged; }
  get notLogged() { return this.state == State.NotLogged; }

  constructor(private a: AuthService) { }

  async ngOnInit() {
    await this.a.init();

    this.a.idClaims.subscribe(c =>
      this.state = c ? State.Logged : State.NotLogged
    );
  }

  login() { this.a.login(); }
  register() { this.a.login(); }
}

enum State {
  Loading,
  NotLogged,
  Logged
}
