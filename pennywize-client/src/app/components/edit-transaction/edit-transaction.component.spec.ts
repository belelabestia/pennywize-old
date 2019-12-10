import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionComponent } from './edit-transaction.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Transaction } from 'src/app/models/transaction';
import { ErrorService } from 'src/app/services/error.service';
import { Error } from 'src/app/models/error';

describe('NewTransactionComponent', () => {
  let component: EditTransactionComponent;
  let fixture: ComponentFixture<EditTransactionComponent>;
  let element: HTMLElement;
  let controller: HttpTestingController;
  let errorService: ErrorService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTransactionComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTransactionComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    controller = TestBed.get(HttpTestingController);
    errorService = TestBed.get(ErrorService);
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

    await promise;

    Object.keys(component.transaction).forEach(
      k => expect(component.transaction[k]).toBeFalsy()
    );

    expect(component.posting).toBe(false);
  });

  it('should handle error on saving', async () => {
    const transaction = new Transaction({
      date: new Date(),
      amount: 5654,
      type: 'cjsohfvs',
      description: '0fer9hgr0e9h'
    });

    component.transaction = transaction;

    const promise = component.save();

    const post = controller.expectOne('api/transactions');
    post.error(new ErrorEvent('test error'));

    await promise;
    expect(component.posting).toBe(false);
    expect(component.transaction).toBe(transaction);
  });

  it('should dispatch error if saving goes wrong', async () => {
    const spy = jasmine.createSpy('error subscriber', (error: Error) => {
      expect(error.message).toBe('error saving transaction');
    })
      .and.callThrough();

    errorService.error.subscribe(spy);

    const promise = component.save();

    const req = controller.expectOne('api/transactions');
    req.error(new ErrorEvent('test error'));

    await expectAsync(promise).toBeResolved();
    expect(spy).toHaveBeenCalled();
  });
});
