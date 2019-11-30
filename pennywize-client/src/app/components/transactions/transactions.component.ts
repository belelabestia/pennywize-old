import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[];

  constructor(private hc: HttpClient) {}

  ngOnInit() {
    this.hc.get<Transaction[]>('api/transactions').subscribe(t => this.transactions = t);
  }
}
