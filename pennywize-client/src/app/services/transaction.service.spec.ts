import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TransactionService } from './transaction.service';
import { Transaction } from '../models/transaction';

fdescribe('TransactionService', () => {
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

    const spy = jasmine.createSpy('subscriber', tt => {
      expect(tt).toEqual(transactions);
    })
      .and.callThrough();

    service.transactions.subscribe(spy);

    const promise = service.get();

    const req = controller.expectOne('api/transactions');
    expect(req.request.method).toBe('GET');
    req.flush(transactions);

    await expectAsync(promise).toBeResolved();
    expect(spy).toHaveBeenCalled();
  });

  it('should post a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'dasjifo8hfh8f'
    });

    const spy = jasmine.createSpy('subscriber', tt => {
      expect(tt).toContain(transaction);
    })
      .and.callThrough();

    service.transactions.subscribe(spy);

    const post = service.post(transaction);

    controller.expectOne('api/transactions').flush(transaction);
    controller.expectOne('api/transactions').flush([transaction]);

    await expectAsync(post).toBeResolved();
    expect(spy).toHaveBeenCalled();
  });

  it('should put a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'description'
    });

    const put = service.put(transaction);

    controller.expectOne('api/transactions/fhtc5ueyc89ny').flush(null);
    controller.expectOne('api/transactions').flush([transaction]);

    await expectAsync(put).toBeResolved();
  });

  it('should delete a transaction', async () => {
    const $delete = service.delete(new Transaction({
      id: 'u0few8rh0g'
    }));

    controller.expectOne('api/transactions/u0few8rh0g').flush(null);
    controller.expectOne('api/transactions').flush([]);

    await expectAsync($delete).toBeResolved();
  });
});
