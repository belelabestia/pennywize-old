import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTransactionComponent } from './new-transaction.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Transaction } from 'src/app/models/transaction';

describe('NewTransactionComponent', () => {
  let component: NewTransactionComponent;
  let fixture: ComponentFixture<NewTransactionComponent>;
  let element: HTMLElement;
  let controller: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewTransactionComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTransactionComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    controller = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    controller.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should bind view fields to property', () => {
    const [date, amount, type, description] = Array.from(element.querySelectorAll('input'));

    date.valueAsDate = new Date();
    amount.valueAsNumber = 214;
    type.value = 'fj0j';
    description.value = 'hd40rvefss';

    [date, amount, type, description].forEach(i => i.dispatchEvent(new Event('input')));

    const t = component.transaction;

    expect(
      t.date.getTime() == date.valueAsDate.getTime() &&
      t.amount == amount.valueAsNumber &&
      t.type == type.value &&
      t.description == description.value
    ).toBeTruthy();
  });

  it('should save new transaction', async () => {
    component.transaction = new Transaction({
      date: new Date(),
      amount: 5654,
      type: 'cjsohfvs',
      description: '0fer9hgr0e9h'
    });

    expect(component.posting).toBe(false);

    const promise = component.save();

    expect(component.posting).toBe(true);

    const post = controller.expectOne('api/transactions');
    post.flush(component.transaction);

    const get = controller.expectOne('api/transactions');
    get.flush([component.transaction]);

    Object.keys(component.transaction).forEach(
      k => expect(component.transaction[k]).toBeFalsy()
    );

    await promise;

    expect(component.posting).toBe(false);
  });

  it('should handle error on saving', async () => {
    component.transaction = new Transaction({
      date: new Date(),
      amount: 5654,
      type: 'cjsohfvs',
      description: '0fer9hgr0e9h'
    });

    const promise = component.save();

    const post = controller.expectOne('api/transactions');
    post.error(new ErrorEvent('test error'));

    await promise;
    expect(component.posting).toBe(false);
  });
});
