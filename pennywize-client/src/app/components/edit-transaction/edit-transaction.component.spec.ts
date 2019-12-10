import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionComponent } from './edit-transaction.component';
import { FormsModule } from '@angular/forms';
import { Transaction } from 'src/app/models/transaction';

describe('EditTransactionComponent', () => {
  let component: EditTransactionComponent;
  let fixture: ComponentFixture<EditTransactionComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTransactionComponent],
      imports: [FormsModule]
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

  it('should show cancel when transaction hasn\'t id', () => {
    component.transaction = new Transaction();
    fixture.detectChanges();

    expect(component.canCancel).toBe(true);
    expect(component.canDelete).toBe(false);
  });

  it('should show delete when transaction has id', () => {
    component.transaction = new Transaction({ id: 'j40rj3f98rh0' });
    fixture.detectChanges();

    expect(component.canCancel).toBe(false);
    expect(component.canDelete).toBe(true);
  });

  it('should bind view fields to property', () => {
    const t = new Transaction();
    component.transaction = t;

    fixture.detectChanges();

    const dateChangeSpy = spyOn(component, 'dateChange').and.callThrough();

    const [date, amount, type, description] = Array.from(element.querySelectorAll('input'));

    date.valueAsDate = new Date('2012-05-15');
    amount.valueAsNumber = 214;
    type.value = 'fj0j';
    description.value = 'hd40rvefss';

    [date, amount, type, description].forEach(i => i.dispatchEvent(new Event('input')));

    expect(dateChangeSpy).toHaveBeenCalledWith('2012-05-15');

    expect(
      t.date.getTime() == date.valueAsDate.getTime() &&
      t.amount == amount.valueAsNumber &&
      t.type == type.value &&
      t.description == description.value
    ).toBeTruthy();
  });
});
