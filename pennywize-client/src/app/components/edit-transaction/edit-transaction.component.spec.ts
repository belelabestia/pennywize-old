import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionComponent } from './edit-transaction.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Transaction } from 'src/app/models/transaction';
import { MaterialModule } from 'src/app/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { first } from 'rxjs/operators';
import { format } from 'url';

describe('EditTransactionComponent', () => {
  let component: EditTransactionComponent;
  let fixture: ComponentFixture<EditTransactionComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTransactionComponent],
      imports: [
        ReactiveFormsModule,
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

  it('should not save an invalid transaction', () => {
    component.transaction = new Transaction();
    fixture.detectChanges();

    const save = jasmine.createSpy('save');

    component.save.subscribe(save);
    component.emitSave();

    expect(save).not.toHaveBeenCalled();
  });

  it('should save valid transaction', () => {
    component.transaction = new Transaction();
    fixture.detectChanges();

    const save = jasmine.createSpy('save');

    component.save.subscribe(save);

    component.form.controls.type.setValue('hfiashfpiahfs');
    component.form.controls.amount.setValue(50);
    component.form.controls.description.setValue('jvipdhgpohjspdjhsdfpj');
    component.form.controls.date.setValue('2005-11-25');

    component.emitSave();

    expect(save).toHaveBeenCalled();
  });
});
