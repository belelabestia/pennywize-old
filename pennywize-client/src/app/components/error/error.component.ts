import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  constructor(
    private d: MatDialogRef<ErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string
  ) { }

  close() {
    this.d.close();
  }
}