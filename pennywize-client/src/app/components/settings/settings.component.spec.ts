import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings.component';
import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { IdClaims } from 'src/app/auth/interfaces';

fdescribe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let service: Partial<AuthService>;
  const idClaimsSub = new BehaviorSubject<IdClaims>({});

  let authServiceStub = {
    idClaims: idClaimsSub.asObservable(),
    async auth() { },
    logout() { }
  };

  beforeEach(async(() => {
    authServiceStub = {
      idClaims: idClaimsSub.asObservable(),
      async auth() { },
      logout() { }
    };

    TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [SettingsComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsComponent);
    service = TestBed.get(AuthService);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should get claims', () => {
    component.ngOnInit();
    expect(component.claims).toBeDefined();
  });

  it('should logout', () => {
    component.ngOnInit();

    const logout = spyOn(service, 'logout');
    const auth = spyOn(service, 'auth');

    component.logout();

    expect(logout).toHaveBeenCalled();
    expect(auth).toHaveBeenCalled();
  });
});
