import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  readonly url = 'api/transactions';
  private transactionsSub = new BehaviorSubject<Transaction[]>([]);
  transactions = this.transactionsSub.asObservable();

  constructor(private hc: HttpClient) { }

  async get(): Promise<void> {
    const newTt = (await this.hc.get<Transaction[]>(this.url).toPromise())
      .map(t => new Transaction(t));

    this.transactionsSub.next(newTt);
  }

  async post(t: Transaction): Promise<void> {
    const newTran = await this.hc.post<Transaction>(this.url, t).toPromise();
    Object.assign(t, newTran);

    const tt = this.transactionsSub.value;
    tt.push(t);
    this.transactionsSub.next(tt);
  }

  async put(t: Transaction): Promise<void> {
    const tt = this.transactionsSub.value;
    const tIdx = tt.findIndex(e => e.id == t.id);

    if (tIdx < 0) {
      throw new Error('cannot put object that is not in collection');
    }

    await this.hc.put(`${this.url}/${t.id}`, t).toPromise();

    tt[tIdx] = t;
    this.transactionsSub.next(tt);
  }

  async delete(t: Transaction): Promise<void> {
    const tt = this.transactionsSub.value;
    const tIdx = tt.findIndex(e => e.id == t.id);

    if (tIdx < 0) {
      throw new Error('cannot delete object that is not in collection');
    }

    await this.hc.delete(`${this.url}/${t.id}`).toPromise();

    tt.splice(tIdx, 1);
    this.transactionsSub.next(tt);
  }
}
