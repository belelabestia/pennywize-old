import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTransactionComponent {
  @Input() transaction: Transaction;
  @Input() disabled = false;

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  get canDelete() {
    return !!this.transaction.id;
  }

  emitSave() {
    this.save.emit();
  }

  emitCancel() {
    this.cancel.emit();
  }

  emitDelete() {
    this.delete.emit();
  }
}
