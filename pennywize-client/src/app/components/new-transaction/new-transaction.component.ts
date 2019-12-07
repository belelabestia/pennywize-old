import { Component } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.css']
})
export class NewTransactionComponent {
  transaction: Transaction = new Transaction();
  posting = false;

  constructor(private t: TransactionService) { }

  save() {
    this.posting = true;
    this.transaction = new Transaction();
    return this.t.post(this.transaction).then(() => this.posting = false);
  }

  dateChange(date: string) {
    this.transaction.date = new Date(date);
  }
}
