import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionComponent } from './edit-transaction.component';
import { FormsModule } from '@angular/forms';
import { Transaction } from 'src/app/models/transaction';
import { MaterialModule } from 'src/app/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EditTransactionComponent', () => {
  let component: EditTransactionComponent;
  let fixture: ComponentFixture<EditTransactionComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTransactionComponent],
      imports: [
        FormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTransactionComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('should create', () => {
    component.transaction = new Transaction();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show delete when transaction has id', () => {
    component.transaction = new Transaction({ id: 'j40rj3f98rh0' });
    fixture.detectChanges();
    expect(component.canDelete).toBe(true);
  });
});
