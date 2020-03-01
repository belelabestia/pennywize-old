import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ErrorService } from './services/error.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { IdClaims } from './auth/interfaces';
import { MaterialModule } from './material.module';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let service: ErrorService;
  let component: AppComponent;
  let authServiceStub: Partial<AuthService>;

  beforeEach(() => {
    const idClaimsSub = new BehaviorSubject<IdClaims>(null);

    authServiceStub = {
      idClaims: idClaimsSub.asObservable(),
      async auth() {
        idClaimsSub.next({});
      }
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MaterialModule
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
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should receive error', async () => {
    await component.ngOnInit();
    service.dispatch('test error');
    expect(component.errorMessage).toBe('test error');
  });

  it('should try authentication', async () => {
    spyOn(authServiceStub, 'auth').and.callThrough();

    const init = component.ngOnInit();
    expect(component.logging).toBe(true);

    await expectAsync(init).toBeResolved();
    expect(component.logging).toBe(false);
  });
});
