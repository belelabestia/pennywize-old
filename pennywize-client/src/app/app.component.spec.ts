import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ErrorService } from './services/error.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { IdClaims, AuthConf } from './auth/interfaces';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let service: ErrorService;
  let component: AppComponent;
  let authServiceStub: Partial<AuthService>;

  beforeEach(() => {
    const idClaimsSub = new BehaviorSubject<IdClaims>(null);

    authServiceStub = {
      idClaims: idClaimsSub.asObservable(),
      configure(conf: AuthConf) { },
      auth() {
        return new Promise(resolve => {
          idClaimsSub.next({});
          resolve();
        });
      }
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub }
      ]
    });

    fixture = TestBed.createComponent(AppComponent);
    service = TestBed.get(ErrorService);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should receive error', async () => {
    service.dispatch('test error');
    await fixture.whenStable();
    expect(component.errorMessage).toBe('test error');
  });
});
