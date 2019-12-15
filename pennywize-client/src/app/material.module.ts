import { NgModule } from '@angular/core';

import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MAT_DATE_LOCALE
} from '@angular/material';

const modules = [
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule
];

@NgModule({
  imports: modules,
  exports: modules,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT'}
  ]
})
export class MaterialModule { }
