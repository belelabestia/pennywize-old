import { ErrorService } from './error.service';
import { Error } from '../models/error';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    service = new ErrorService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch erorr', () => {
    const spy = jasmine.createSpy('subscriber');
    const error = new Error({ message: 'ciao', data: { prop: 'testprop' } });

    service.error.subscribe(spy);
    service.dispatch(error.message, error.data);

    expect(spy.calls.first().args[0]).toEqual(error);
  });
});
