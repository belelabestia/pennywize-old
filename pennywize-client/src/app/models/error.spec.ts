import { Error } from './error';

describe('Error', () => {
  it('should create an instance', () => {
    expect(new Error()).toBeTruthy();
  });

  it('should create an instance with partial', () => {
    const partial: Partial<Error> = {
      message: 'jfejfe'
    };

    expect(new Error(partial)).toBeTruthy();
  });
});
