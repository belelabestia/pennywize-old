import { Transaction } from './transaction';

describe('Transaction', () => {
  it('should create an instance', () => {
    expect(new Transaction()).toBeTruthy();
  });

  it('should create an instance with partial', () => {
    const partial: any = {
      id: '0u9gu0g4er3',
      amount: 2305,
      description: '53082rhfe',
      date: '2019-12-14T23:00:00Z'
    };

    const transaction = new Transaction(partial);

    expect(transaction).toBeTruthy();

    expect(
      transaction.id == partial.id &&
      transaction.amount == partial.amount &&
      transaction.description == partial.description &&
      transaction.date.getTime() == new Date(partial.date).getTime()
    ).toBeTruthy();
  });
});
