import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit {
  transactions = this.t.transactions;
  current: Transaction;
  requesting = false;

  get canAdd() {
    return !this.current;
  }

  get canEdit() {
    return !!this.current;
  }

  constructor(
    private t: TransactionService,
    private e: ErrorService
  ) { }

  async ngOnInit() {
    await this.t.get()
      .catch(() => { this.e.dispatch('error loading transactions'); });
  }

  add() {
    this.current = new Transaction();
  }

  edit(transaction: Transaction) {
    this.current = new Transaction(transaction);
  }

  async save() {
    this.requesting = true;

    const operation = this.current.id ? () => this.put() : () => this.post();

    await operation()
      .catch(() => { this.e.dispatch('error saving transaction'); })
      .finally(() => { this.requesting = false; });
  }

  cancel() {
    this.current = null;
  }

  async delete() {
    this.requesting = true;
    await this.t.delete(this.current)
      .catch(() => { this.e.dispatch('error deleting transaction'); })
      .finally(() => this.requesting = false);
  }

  private async post() {
    await this.t.post(this.current)
      .then(() => { this.current = new Transaction(); })
      .finally(() => { this.current = null; });
  }

  private async put() {
    await this.t.put(this.current);
  }
}
