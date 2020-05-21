import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding, OnDestroy, HostListener } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Transaction } from 'src/app/models/transaction';
import { TransactionService } from 'src/app/services/transaction.service';
import { Subscription, combineLatest, SubscriptionLike } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ErrorComponent } from '../error/error.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

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
    private d: MatDialog,
    private r: Router,
    private a: ActivatedRoute,
    private l: Location
  ) { }

  async ngOnInit() {
    let sub: SubscriptionLike;

    sub = this.l.subscribe(() => this.l.go('/transactions'));
    this.subscription.add(sub);

    sub = combineLatest(
      this.t.transactions,
      this.a.paramMap
    ).subscribe(([tt, p]) => {
      this.transactions = tt;

      const id = p.get('id');
      this.current = id ?
        id == 'new' ?
          new Transaction() :
          this.transactions.find(t => t.id == id) :
        null;

      this.l.go('/transactions');
      if (id) this.l.go(`/transactions/${id}`);

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

  @HostListener('window:keyup.alt.n')
  add() { this.r.navigateByUrl('/transactions/new'); }

  edit(transaction: Transaction) { this.r.navigateByUrl(`/transactions/${transaction.id}`); }
  cancel() { this.r.navigateByUrl('/transactions'); }

  @HostListener('window:keydown.arrowup', ['$event'])
  editPrev(event: KeyboardEvent) {
    event.preventDefault();

    if (!this.transactions) return;

    const index = this.transactions.indexOf(this.current);
    if (index - 1 >= 0) this.r.navigateByUrl(`/transactions/${this.transactions[index - 1].id}`);
  }

  @HostListener('window:keydown.arrowdown', ['$event'])
  editNext(event: KeyboardEvent) {
    event.preventDefault();
    if (!this.transactions) return;

    const index = this.transactions.indexOf(this.current);
    if (index + 1 < this.transactions.length) this.r.navigateByUrl(`/transactions/${this.transactions[index + 1].id}`);
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

  ngOnDestroy() { this.subscription.unsubscribe(); }
}
