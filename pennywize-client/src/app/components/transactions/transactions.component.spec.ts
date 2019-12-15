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

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let controller: HttpTestingController;
  let element: HTMLElement;
  let errorService: ErrorService;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show transactions', async () => {
    const req = controller.expectOne('api/transactions');

    req.flush([
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

    const stable = fixture.whenStable();
    const received = component.transactions.pipe(first()).toPromise();

    await expectAsync(Promise.all([stable, received])).toBeResolved();

    fixture.detectChanges();

    const transactions = element.querySelectorAll('app-transaction');
    expect(transactions.length).toBe(2);
  });

  it('should handle fetch error', async () => {
    const err = errorService.error.pipe(first()).toPromise();
    const stable = fixture.whenStable();

    controller.expectOne('api/transactions').error(new ErrorEvent('test error'));

    await expectAsync(Promise.all([err, stable])).toBeResolved();
  });

  it('should edit when app-transaction emits', async () => {
    const edit = () => element.querySelector('app-edit-transaction');

    const transaction = new Transaction({
      id: 'dehwofh0ew',
      amount: -51,
      date: new Date(93935585),
      description: 'hrf80wyhrg',
      type: 'fhr9fher'
    });

    await fixture.whenStable();

    expect(edit()).toBeFalsy();

    component.edit(transaction);

    fixture.detectChanges();

    expect(edit()).toBeTruthy();
  });

  it('should edit new on add button click', async () => {
    const edit = () => element.querySelector('app-edit-transaction');

    expect(edit()).toBeFalsy();

    await fixture.whenStable();

    component.add();

    fixture.detectChanges();

    expect(edit()).toBeTruthy();
  });

  it('should empty current transaction when deleted', async () => {
    const transaction = new Transaction({
      id: 'f9ewujg',
      amount: 50,
      date: new Date(33380058),
      description: 'fj0ew89yge0h',
      type: 'jivd'
    });

    controller.expectOne('api/transactions').flush([transaction]);

    await fixture.whenStable();

    component.current = transaction;

    const del = component.delete();

    controller.expectOne('api/transactions/f9ewujg').flush(null);

    await expectAsync(del).toBeResolved();

    expect(component.current).toBeNull();
    expect(component.requesting).toBe(false);
  });
});
