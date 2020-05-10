import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, ViewChild } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { FormBuilder, FormGroup, Validators, FormGroupDirective, NgForm } from '@angular/forms';

@Component({
  selector: 'app-edit-transaction',
  templateUrl: './edit-transaction.component.html',
  styleUrls: ['./edit-transaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTransactionComponent {
  @ViewChild(FormGroupDirective, { static: true }) form: NgForm;

  formGroup = this.fb.group({
    id: [undefined],
    amount: ['', Validators.required],
    date: ['', Validators.required],
    type: ['', Validators.required],
    description: [''],
    userId: [undefined]
  });

  @Output() save = new EventEmitter<Transaction>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  @Input() set transaction(t: Transaction) {
    this.updateForm(t, this.disabled);
  }

  get transaction(): Transaction {
    return this.formGroup ? new Transaction(this.formGroup.value) : undefined;
  }

  @Input() set disabled(d: boolean) {
    this.updateForm(this.transaction, d);
  }

  get disabled(): boolean {
    return this.formGroup ? this.formGroup.disabled : false;
  }

  get canDelete() {
    return !!this.transaction.id;
  }

  constructor(private fb: FormBuilder) { }

  @HostListener('window:keyup.control.enter')
  emitSave() {
    if (this.formGroup && this.formGroup.valid) {
      this.save.emit(this.transaction);
      this.form.resetForm();
    }
  }

  @HostListener('window:keyup.esc')
  emitCancel() {
    this.cancel.emit();
  }

  @HostListener('window:keyup.delete', ['$event.target'])
  emitDelete(el: Element) {
    if (
      el &&
      el.nodeName == 'TEXTAREA' ||
      el.nodeName == 'INPUT'
    ) return;

    if (!this.transaction.id) return;

    this.delete.emit();
  }

  private updateForm(transaction: Transaction, disabled: boolean) {
    if (!transaction) return;

    this.formGroup.reset();
    this.formGroup.patchValue(transaction);

    if (disabled) this.formGroup.disable();
    else this.formGroup.enable();
  }
}
