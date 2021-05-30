import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  handleError<T>(operation = "function", result?: T) {
    return (error): Observable<T> => {
      console.log(`${operation} has error -  ${error.message}`);
      return throwError(error);
    }
  }
}
