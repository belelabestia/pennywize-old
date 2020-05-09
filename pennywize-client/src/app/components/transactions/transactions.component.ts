import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding, OnDestroy, HostListener } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from '../error/error.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit, OnDestroy {
  @HostBinding('class.mobile') isMobile = false;
  transactions: Transaction[];
  subscription = new Subscription();

  current: Transaction;
  requesting = false;
  loading = true;

  get canAdd() { return !this.current; }
  get canEdit() { return !!this.current; }

  constructor(
    private t: TransactionService,
    private cd: ChangeDetectorRef,
    private bo: BreakpointObserver,
    private d: MatDialog
  ) { }

  async ngOnInit() {
    const sub = this.t.transactions.subscribe(tt => {
      this.transactions = tt;
      this.cd.detectChanges();
    });

    this.subscription.add(sub);

    try { await this.t.get(); }
    catch { this.d.open(ErrorComponent, { data: 'error loading transactions' }); }

    this.loading = false;
    this.cd.markForCheck();

    this.bo.observe([Breakpoints.Handset])
      .subscribe(result => this.isMobile = result.matches);
  }

  ngOnDestroy() { this.subscription.unsubscribe(); }
  add() { this.current = new Transaction(); }
  edit(transaction: Transaction) { this.current = transaction; }
  cancel() { this.current = null; }

  @HostListener('window:keydown.arrowup', ['$event'])
  editPrev(event: KeyboardEvent) {
    event.preventDefault();

    if (!this.transactions) return;

    const index = this.transactions.indexOf(this.current);
    if (index - 1 >= 0) this.current = this.transactions[index - 1];
  }

  @HostListener('window:keydown.arrowdown', ['$event'])
  editNext(event: KeyboardEvent) {
    event.preventDefault();
    if (!this.transactions) return;

    const index = this.transactions.indexOf(this.current);
    if (index + 1 < this.transactions.length) this.current = this.transactions[index + 1];
  }

  async save(t: Transaction) {
    this.requesting = true;
    this.current = t;

    try {
      if (this.current.id) await this.put();
      else await this.post();
    } catch {
      this.d.open(ErrorComponent, { data: 'error saving transaction' });
    } finally {
      this.cd.markForCheck();
      this.requesting = false;
    }

    this.add();
  }

  async delete() {
    this.requesting = true;

    try { await this.t.delete(this.current); }
    catch {
      this.d.open(ErrorComponent, { data: 'error deleting transaction' });
    } finally {
      this.cd.markForCheck();
      this.requesting = false;
      this.current = null;
    }
  }

  private async post() { await this.t.post(this.current); }
  private async put() { await this.t.put(this.current); }
}
