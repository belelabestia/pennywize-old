import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.css']
})
export class NewTransactionComponent implements OnInit {
  transaction: Transaction = new Transaction();

  constructor(private hc: HttpClient) { }

  ngOnInit() {
  }

  save() {
    this.hc.post('api/transactions', this.transaction).subscribe();
    this.transaction = new Transaction();
  }
}
