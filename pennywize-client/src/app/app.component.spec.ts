import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ErrorService } from './services/error.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let service: ErrorService;
  let component: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    service = TestBed.get(ErrorService);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should receive error', async () => {
    service.dispatch('test error');
    await fixture.whenStable();
    expect(component.errorMessage).toBe('test error');
  });
});
