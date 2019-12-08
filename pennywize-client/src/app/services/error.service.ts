import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Error } from '../models/error';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSub = new Subject<Error>();
  error = this.errorSub.asObservable();

  dispatch(message: string, data?: any) {
    this.errorSub.next(new Error({ message, data }));
  }
}
