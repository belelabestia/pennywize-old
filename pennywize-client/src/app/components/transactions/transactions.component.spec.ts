import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from '../transaction/transaction.component';
import { NewTransactionComponent } from '../new-transaction/new-transaction.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Transaction } from 'src/app/models/transaction';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;
  let element: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TransactionsComponent,
        TransactionComponent,
        NewTransactionComponent
      ],
      imports: [
        FormsModule,
        HttpClientTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain new transaction', () =>  {
    const newTran = element.querySelector('app-new-transaction');
    expect(newTran).toBeTruthy();
  });

  it('should show "loading" if there\'s no transaction', () => {
    const pp = Array.from(element.querySelectorAll('p'));
    expect(pp.some(p => p.innerText.includes('Loading...'))).toBeTruthy();
  });

  it('sould show transactions', () => {
    component.transactions = [
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
    ];

    fixture.detectChanges();

    const transactions = element.querySelectorAll('app-transaction');
    expect(transactions.length).toBe(2);
  });
});
