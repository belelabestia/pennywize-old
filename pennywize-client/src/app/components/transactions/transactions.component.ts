import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions = this.t.transactions;
  loading = false;
  error = false;

  constructor(private t: TransactionService) { }

  async ngOnInit() {
    this.loading = true;

    await this.t.get()
      .catch(() => { this.error = true; })
      .finally(() => { this.loading = false; });
  }
}
