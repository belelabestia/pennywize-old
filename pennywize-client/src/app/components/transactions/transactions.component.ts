import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
  @HostBinding('class.mobile') isMobile = false;
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
    private e: ErrorService,
    private cd: ChangeDetectorRef,
    private bo: BreakpointObserver
  ) { }

  async ngOnInit() {
    await this.t.get()
      .catch(() => { this.e.dispatch('error loading transactions'); });

    this.bo.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
    });
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
      .finally(() => {
        this.cd.markForCheck();
        this.requesting = false;
      });
  }

  cancel() {
    this.current = null;
  }

  async delete() {
    this.requesting = true;
    await this.t.delete(this.current)
      .catch(() => { this.e.dispatch('error deleting transaction'); })
      .finally(() => {
        this.cd.markForCheck();
        this.requesting = false;
        this.current = null;
      });
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
