import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TransactionService } from './transaction.service';
import { Transaction } from '../models/transaction';

describe('TransactionService', () => {
  let httpTestingController: HttpTestingController;
  let transactionService: TransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    transactionService = TestBed.get(TransactionService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(transactionService).toBeTruthy();
  });

  it('should get transactions', () => {
    const transactions: Transaction[] = [
      new Transaction({
        id: 'gubh78yb79bt',
        amount: 340,
        date: new Date(),
        type: 'benzina',
        description: 'esfpjpigvp'
      }),
      new Transaction({
        id: 'fhush8werh',
        amount: 340,
        date: new Date(),
        type: 'svago',
        description: 'fheshesiohfs'
      }),
      new Transaction({
        id: '78tb7tbt87tn',
        amount: 340,
        date: new Date(),
        type: 'bollette',
        description: 'gas'
      }),
    ];

    transactionService.transactions.subscribe(
      tt => expect(tt).toEqual(transactions)
    );

    transactionService.get();

    const req = httpTestingController.expectOne('api/transactions');
    expect(req.request.method).toBe('GET');
    req.flush(transactions);
  });

  it('should post a transaction', () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'dasjifo8hfh8f'
    });

    transactionService.transactions.subscribe(tt =>
      expect(tt).toContain(transaction)
    );

    transactionService.post(transaction);

    const req0 = httpTestingController.expectOne('api/transactions');
    expect(req0.request.method).toBe('POST');
    req0.flush(transaction);

    const req1 = httpTestingController.expectOne('api/transactions');
    expect(req1.request.method).toBe('GET');
    req1.flush([transaction]);
  });
});
