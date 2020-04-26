import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TransactionService } from './transaction.service';
import { Transaction } from '../models/transaction';
import { first, skip, filter, tap } from 'rxjs/operators';

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

    const tt = service.transactions.pipe(skip(1), first()).toPromise();
    const get = service.get();
    controller.expectOne(service.url).flush(transactions);

    await expectAsync(Promise.all([get, tt])).toBeResolved();
  });

  fit('should refresh transactions', async () => {
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

    const get = service.get();
    controller.expectOne(service.url).flush(transactions);
    await get;

    const tt = service.transactions.pipe(skip(1), first()).toPromise();
    const get1 = service.get();
    controller.expectOne(service.url).flush(transactions);
    await get1;

    await expectAsync(tt).toBeResolvedTo(transactions);
  });

  it('should post a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'dasjifo8hfh8f'
    });

    let transactions: Transaction[];

    const tt = service.transactions
      .pipe(skip(1), first(), tap(t => transactions = t))
      .toPromise();

    const post = service.post(transaction);
    controller.expectOne(service.url).flush(transaction);

    await expectAsync(Promise.all([post, tt])).toBeResolved();
    expect(transactions).toContain(transaction);
  });

  it('should put a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'description'
    });

    const post = service.post(transaction);
    controller.expectOne(service.url).flush(transaction);
    await post;

    let transactions: Transaction[];

    const tt = service.transactions
      .pipe(skip(1), first(), tap(t => transactions = t))
      .toPromise();

    const put = service.put(transaction);
    controller.expectOne(`${service.url}/${transaction.id}`).flush(null);

    await expectAsync(Promise.all([tt, put])).toBeResolved();
    expect(transactions).toContain(transaction);
  });

  it('shouldn\' put a transaction if not in collection', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'description'
    });

    const put = service.put(transaction);
    controller.expectNone(`${service.url}/${transaction.id}`);

    await expectAsync(put).toBeRejected();
  });

  it('should delete a transaction', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'description'
    });

    const post = service.post(transaction);
    controller.expectOne(service.url).flush(transaction);
    await post;

    let transactions: Transaction[];

    const tt = service.transactions
      .pipe(skip(1), first(), tap(t => transactions = t))
      .toPromise();

    const del = service.delete(transaction);
    controller.expectOne(`${service.url}/${transaction.id}`).flush(transaction);

    await expectAsync(Promise.all([tt, del])).toBeResolved();
    expect(transactions).not.toContain(transaction);
  });

  it('shouldn\' delete a transaction if not in collection', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'description'
    });

    const del = service.delete(transaction);
    controller.expectNone(`${service.url}/${transaction.id}`);

    await expectAsync(del).toBeRejected();
  });

  it('post/put/delete should reject if server throws', async () => {
    const transaction = new Transaction({
      id: 'fhtc5ueyc89ny',
      amount: 843,
      date: new Date(),
      type: 'y49w8tgh',
      description: 'dasjifo8hfh8f'
    });

    let post = service.post(transaction);
    controller.expectOne(service.url).error(new ErrorEvent('500'));

    await expectAsync(post).toBeRejected();

    post = service.post(transaction);
    controller.expectOne(service.url).flush(transaction);
    await post;

    const put = service.put(transaction);
    controller.expectOne(`${service.url}/${transaction.id}`).error(new ErrorEvent('500'));
    await expectAsync(put).toBeRejected();

    post = service.post(transaction);
    controller.expectOne(service.url).flush(transaction);
    await post;

    const del = service.delete(transaction);
    controller.expectOne(`${service.url}/${transaction.id}`).error(new ErrorEvent('500'));
    await expectAsync(del).toBeRejected();
  });
});
