import { Component, OnInit } from '@angular/core';
import { Transaction } from 'src/app/models/transaction';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [
    {
      id: '6kklkjkough0gyuv',
      amount: '50',
      type: 'svago',
      date: new Date(),
      description: 'puttaneeee'
    },
    {
      id: 'rd7ufoeg0cbrye59ty',
      amount: '1000',
      type: 'svago',
      date: new Date(),
      description: 'casinò'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
