import { NgModule } from '@angular/core';

import {
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule
} from '@angular/material';

const modules = [
  MatCardModule,
  MatButtonModule,
  MatIconModule,
  MatInputModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule { }
