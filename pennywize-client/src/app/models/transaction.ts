export class Transaction {
  id: string;
  date: Date;
  amount: number;
  type: string;
  description: string;

  constructor(partial?: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
