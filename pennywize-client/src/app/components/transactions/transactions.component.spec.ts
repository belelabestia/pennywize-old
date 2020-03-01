import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from '../transaction/transaction.component';
import { EditTransactionComponent } from '../edit-transaction/edit-transaction.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Transaction } from 'src/app/models/transaction';
import { ErrorService } from 'src/app/services/error.service';
import { first } from 'rxjs/operators';
import { ChangeDetectionStrategy } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Error } from 'src/app/models/error';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let controller: HttpTestingController;
  let element: HTMLElement;
  let errorService: ErrorService;
  const url = 'api/transactions';

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TransactionsComponent,
        TransactionComponent,
        EditTransactionComponent
      ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        MaterialModule,
        BrowserAnimationsModule
      ]
    })
      .overrideComponent(TransactionsComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    controller = TestBed.get(HttpTestingController);
    errorService = TestBed.get(ErrorService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show transactions', async () => {
    const init = component.ngOnInit();

    controller.expectOne(url).flush([
      new Transaction({
        id: 'hfrhe08rhg09',
        amount: 340,
        type: '3h8hf',
        date: new Date(),
        description: '834g8hfvggf'
      }),
      new Transaction({
        id: '8gh98g98g89g98g',
        amount: 3890,
        type: 'h08hg08gh',
        date: new Date(),
        description: 'y8y98h80h80h'
      })
    ]);

    await expectAsync(init).toBeResolved();
    fixture.detectChanges();

    const transactions = element.querySelectorAll('app-transaction');
    expect(transactions.length).toBe(2);
  });

  it('should handle fetch error', async () => {
    const init = component.ngOnInit();
    const err = errorService.error.pipe(first()).toPromise();

    controller.expectOne(url).error(new ErrorEvent('test error'));
    await expectAsync(Promise.all([err, init])).toBeResolved();
  });

  it('should edit when app-transaction emits', async () => {
    const init = component.ngOnInit();
    const edit = () => element.querySelector('app-edit-transaction');

    const transaction = new Transaction({
      id: 'dehwofh0ew',
      amount: -51,
      date: new Date(93935585),
      description: 'hrf80wyhrg',
      type: 'fhr9fher'
    });

    controller.expectOne(url).flush([transaction]);
    await expectAsync(init).toBeResolved();

    expect(edit()).toBeFalsy();
    component.edit(transaction);
    fixture.detectChanges();
    expect(edit()).toBeTruthy();
  });

  it('should edit new on add button click', async () => {
    const init = component.ngOnInit();
    const edit = () => element.querySelector('app-edit-transaction');

    controller.expectOne(url).flush([]);
    await expectAsync(init).toBeResolved();

    expect(edit()).toBeFalsy();
    component.add();
    fixture.detectChanges();
    expect(edit()).toBeTruthy();
  });

  it('should empty current transaction when deleted', async () => {
    const init = component.ngOnInit();

    const transaction = new Transaction({
      id: 'f9ewujg',
      amount: 50,
      date: new Date(33380058),
      description: 'fj0ew89yge0h',
      type: 'jivd'
    });

    controller.expectOne('api/transactions').flush([transaction]);
    await expectAsync(init).toBeResolved();

    component.current = transaction;
    const del = component.delete();
    controller.expectOne('api/transactions/f9ewujg').flush(transaction);
    await expectAsync(del).toBeResolved();

    expect(component.current).toBeNull();
    expect(component.requesting).toBe(false);
  });

  it('should save new transaction', async () => {
    const init = component.ngOnInit();
    controller.expectOne('api/transactions').flush([]);
    await expectAsync(init).toBeResolved();

    expect(component.current).toBeFalsy();

    const transaction = new Transaction();
    const save = component.save(transaction);

    expect(component.requesting).toBe(true);
    expect(component.current).toBe(transaction);

    controller.expectOne(req =>
      req.url == 'api/transactions' &&
      req.method == 'POST'
    ).flush(transaction);

    await expectAsync(save).toBeResolved();

    expect(component.requesting).toBe(false);
    expect(component.current).toBe(transaction);
    expect(component.transactions).toContain(transaction);
  });

  it('should save existing transaction', async () => {
    let transaction = new Transaction({
      id: 'ouifeysh9otgsh',
      amount: 50,
      date: new Date('2020-05-05'),
      description: 'some desc',
      type: 'some type'
    });

    const init = component.ngOnInit();
    controller.expectOne('api/transactions').flush([transaction]);
    await expectAsync(init).toBeResolved();

    transaction = new Transaction(transaction);
    transaction.amount = 60;

    const save = component.save(transaction);

    controller.expectOne(req =>
      req.url == 'api/transactions/ouifeysh9otgsh' &&
      req.method == 'PUT'
    ).flush(null);

    expect(component.requesting).toBe(true);
    expect(component.current).toBe(transaction);

    await expectAsync(save).toBeResolved();

    expect(component.current).toBe(transaction);
    expect(component.requesting).toBe(false);
  });

  it('should delete existing transaction', async () => {
    const transaction = new Transaction({
      id: 'ouifeysh9otgsh',
      amount: 50,
      date: new Date('2020-05-05'),
      description: 'some desc',
      type: 'some type'
    });

    const init = component.ngOnInit();
    controller.expectOne('api/transactions').flush([transaction]);
    await expectAsync(init).toBeResolved();

    component.current = transaction;

    const del = component.delete();

    expect(component.requesting).toBe(true);

    controller.expectOne(req =>
      req.url == 'api/transactions/ouifeysh9otgsh' &&
      req.method == 'DELETE'
    ).flush(null);

    await expectAsync(del).toBeResolved();

    expect(component.requesting).toBe(false);
    expect(component.current).toBe(null);
  });

  it('should handle error when saving', async () => {
    let transaction = new Transaction({
      id: 'hew0h0gfw',
      amount: 50,
      date: new Date('2020-05-05'),
      description: 'some desc',
      type: 'some type'
    });

    let errorContent: Error;
    const error = errorService.error.pipe(first()).toPromise().then(e => errorContent = e);

    const init = component.ngOnInit();
    controller.expectOne('api/transactions').flush([transaction]);
    await expectAsync(init).toBeResolved();

    transaction = new Transaction(transaction);
    transaction.amount = 60;

    const save = component.save(transaction);
    controller.expectOne('api/transactions/hew0h0gfw').error(new ErrorEvent('whatever'));

    await expectAsync(Promise.all([save, error])).toBeResolved();
    expect(errorContent.message).toBe('error saving transaction');
  });

  it('should handle error when deleting', async () => {
    const transaction = new Transaction({
      id: 'hew0h0gfw',
      amount: 50,
      date: new Date('2020-05-05'),
      description: 'some desc',
      type: 'some type'
    });

    let errorContent: Error;
    const error = errorService.error.pipe(first()).toPromise().then(e => errorContent = e);

    const init = component.ngOnInit();
    controller.expectOne('api/transactions').flush([transaction]);
    await expectAsync(init).toBeResolved();

    component.current = transaction;

    const del = component.delete();
    controller.expectOne('api/transactions/hew0h0gfw').error(new ErrorEvent('whatever'));

    await expectAsync(Promise.all([del, error])).toBeResolved();
    expect(errorContent.message).toBe('error deleting transaction');
  });
});
