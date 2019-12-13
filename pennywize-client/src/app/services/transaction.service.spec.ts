import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TransactionService } from './transaction.service';
import { Transaction } from '../models/transaction';
import { first } from 'rxjs/operators';

describe('TransactionService', () => {
  let controller: HttpTestingController;
  let service: TransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    controller = TestBed.get(HttpTestingController);
    service = TestBed.get(TransactionService);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get transactions', async () => {
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

    const tt = service.transactions.pipe(first()).toPromise();

    const get = service.get();

    const req = controller.expectOne('api/transactions');
    expect(req.request.method).toBe('GET');
    req.flush(transactions);

    await expectAsync(Promise.all([get, tt])).toBeResolved();
  });

  it('should post a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'dasjifo8hfh8f'
    });

    const tt = service.transactions.pipe(first()).toPromise();

    const post = service.post(transaction)
      .then(() => {
        controller.expectOne('api/transactions', 'get').flush([transaction]);
      });

    controller.expectOne('api/transactions', 'post').flush(transaction);

    await expectAsync(Promise.all([post, tt])).toBeResolved();
  });

  it('should put a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'description'
    });

    const put = service.put(transaction).then(() => {
      controller.expectOne('api/transactions').flush([transaction]);
    });

    controller.expectOne('api/transactions/fhtc5ueyc89ny').flush(null);

    await expectAsync(put).toBeResolved();
  });

  it('should delete a transaction', async () => {
    const $delete = service.delete(new Transaction({
      id: 'u0few8rh0g'
    }))
      .then(() => {
        controller.expectOne('api/transactions').flush([]);
      });

    controller.expectOne('api/transactions/u0few8rh0g').flush(null);

    await expectAsync($delete).toBeResolved();
  });
});
