import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent {
  private _isSelected = false;

  @Input() transaction: Transaction;
  @Output() selected = new EventEmitter<void>();

  @Input() set isSelected(s: boolean) {
    if (s) this.ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    this._isSelected = s;
  }

  get isSelected() { return this._isSelected; }

  get type() {
    return this.transaction.amount == 0 ? '' :
      this.transaction.amount > 0 ?
        'in' :
        'out';
  }

  get ref(): HTMLElement { return this.el.nativeElement as HTMLElement; }

  constructor(private el: ElementRef) { }

  @HostListener('click') emitSelected() { this.selected.emit(); }
}
