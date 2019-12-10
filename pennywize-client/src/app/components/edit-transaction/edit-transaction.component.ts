import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.css']
})
export class EditTransactionComponent {
  @Input() transaction: Transaction;
  
  @Output() saveClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();

  dateChange(date: string) {
    this.transaction.date = new Date(date);
  }

  save() {
    this.saveClick.emit();
  }

  cancel() {
    this.cancelClick.emit();
  }

  delete() {
    this.deleteClick.emit();
  }
}
