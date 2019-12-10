import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent {
  @Input() transaction: Transaction;
  @Output() selected = new EventEmitter<void>();

  @HostListener('click') emitSelected() {
    this.selected.emit();
  }
}
