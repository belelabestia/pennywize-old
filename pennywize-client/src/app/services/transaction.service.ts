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

  get(): Promise<void> {
    return new Promise(resolve => this.hc.get<Transaction[]>(url).subscribe(tt => {
      this.transactionsSub.next(tt);
      resolve();
    }));
  }

  post(t: Transaction): Promise<void> {
    return new Promise(resolve => this.hc.post(url, t).subscribe(() => {
      this.get();
      resolve();
    }));
  }
}
