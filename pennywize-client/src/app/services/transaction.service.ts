import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Transaction } from '../models/transaction';
import { map, switchMap, switchMapTo, mapTo } from 'rxjs/operators';

const url = 'api/transactions';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSub = new Subject<Transaction[]>();
  transactions = this.transactionsSub.asObservable();

  constructor(private hc: HttpClient) { }

  async get(): Promise<void> {
    const tt = await this.hc.get<Partial<Transaction>[]>(url).toPromise();
    this.transactionsSub.next(tt.map(t => new Transaction(t)));
  }

  async post(t: Transaction): Promise<void> {
    await this.hc.post(url, t)
      .pipe(map(() => { this.get(); }))
      .toPromise();
  }

  async put(t: Transaction): Promise<void> {
    await this.hc.put(`${url}/${t.id}`, t)
      .pipe(map(() => { this.get(); }))
      .toPromise();
  }

  async delete(t: Transaction): Promise<void> {
    await this.hc.delete(`${url}/${t.id}`)
      .pipe(map(() => { this.get(); }))
      .toPromise();
  }
}
