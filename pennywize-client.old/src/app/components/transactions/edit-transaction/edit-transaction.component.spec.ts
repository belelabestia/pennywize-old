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

    component.formGroup.controls.type.setValue('hfiashfpiahfs');
    component.formGroup.controls.amount.setValue(50);
    component.formGroup.controls.description.setValue('jvipdhgpohjspdjhsdfpj');
    component.formGroup.controls.date.setValue('2005-11-25');

    component.emitSave();

    expect(save).toHaveBeenCalled();
  });

  it('should update form when transaction changes', () => {
    component.transaction = new Transaction({
      id: 'f94wy8vycr4dw3',
      amount: 50,
      date: new Date('2020-04-02'),
      description: 'some desc',
      type: 'some type'
    });

    fixture.detectChanges();

    expect(component.formGroup.value.id).toBe('f94wy8vycr4dw3');
    expect(component.formGroup.value.amount).toBe(50);
    expect(component.formGroup.value.date.getTime()).toBe(new Date('2020-04-02').getTime());
    expect(component.formGroup.value.description).toBe('some desc');
    expect(component.formGroup.value.type).toBe('some type');

    component.transaction = new Transaction({
      id: 'ouguogouguogug',
      amount: 60,
      date: new Date('2019-05-03'),
      description: 'some other desc',
      type: 'some other type'
    });

    fixture.detectChanges();

    expect(component.formGroup.value.id).toBe('ouguogouguogug');
    expect(component.formGroup.value.amount).toBe(60);
    expect(component.formGroup.value.date.getTime()).toBe(new Date('2019-05-03').getTime());
    expect(component.formGroup.value.description).toBe('some other desc');
    expect(component.formGroup.value.type).toBe('some other type');
  });

  it('should update form when disabled changes', () => {
    component.transaction = new Transaction({
      id: 'f94wy8vycr4dw3',
      amount: 50,
      date: new Date('2020-04-02'),
      description: 'some desc',
      type: 'some type'
    });

    component.disabled = true;
    fixture.detectChanges();
    expect(component.formGroup.disabled).toBe(true);

    component.disabled = false;
    fixture.detectChanges();
    expect(component.formGroup.enabled).toBe(true);
  });
});
