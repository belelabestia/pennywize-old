import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should dispatch erorr', () => {
    const spy = jasmine.createSpy('subscriber', error => {
      expect(error).toBeTruthy();
      expect(error.message).toBe('ciao');
    })
      .and.callThrough();

    service.error.subscribe(spy);

    service.dispatch('ciao');
  });
});
