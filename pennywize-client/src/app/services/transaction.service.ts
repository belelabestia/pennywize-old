import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Transaction } from '../models/transaction';

const url = 'api/transactions';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSub = new Subject<Transaction[]>();
  transactions = this.transactionsSub.asObservable();

  constructor(private hc: HttpClient) { }

  async get(): Promise<void> {
    const tt = await this.hc.get<Transaction[]>(url).toPromise();
    this.transactionsSub.next(tt);
  }

  async post(t: Transaction): Promise<void> {
    await this.hc.post(url, t).toPromise();
    this.get();
  }

  async put(t: Transaction): Promise<void> {
    await this.hc.put(`${url}/${t.id}`, t).toPromise();
    this.get();
  }

  async delete(t: Transaction): Promise<void> {
    await this.hc.delete(`${url}/${t.id}`).toPromise();
    this.get();
  }
}
