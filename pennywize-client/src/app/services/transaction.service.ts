import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction';


@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  url = 'api/transactions';
  private transactionsSub = new BehaviorSubject<Transaction[]>([]);
  transactions = this.transactionsSub.asObservable();

  constructor(private hc: HttpClient) { }

  async get(): Promise<void> {
    let newTt = await this.hc.get<Transaction[]>(this.url).toPromise();
    newTt = newTt.map(t => new Transaction(t));

    const tt = this.transactionsSub.value;
    tt.push(...newTt);
    this.transactionsSub.next(tt.map(t => new Transaction(t)));
  }

  async post(t: Transaction): Promise<void> {
    let newTran = await this.hc.post<Transaction>(this.url, t).toPromise();
    newTran = new Transaction(newTran);

    const tt = this.transactionsSub.value;
    tt.push(newTran);
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

    tt.splice(tIdx, 0);
    this.transactionsSub.next(tt);
  }
}
