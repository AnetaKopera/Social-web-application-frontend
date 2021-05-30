import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { ErrorService } from './error.service';
import { User } from './models/User';
import { Message } from './models/Message';


@Injectable({
  providedIn: 'root'
})

export class MessageService {

  private url = "http://localhost:3000";
  isLoged: boolean = false;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(private authenticationService: AuthenticationService,
    private http: HttpClient,
    private errorService: ErrorService) {

    this.authenticationService.logedUser$.subscribe((logedUser) => {
      this.isLoged = logedUser;
    });
  }

  sendMessage(message: string, receiver: number, id: Pick<User, "id">): Observable<Message[]> {
    return this.http
      .post<Message[]>(`${this.url}/messages/`,
        { message: message, sender: id, receiver: receiver },
        this.httpOptions)
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<Message[]>("sendMessage", []))
      );
  }

  markAsReaded(id_user, id_friend): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/messages/messages_readed/`, { id_user: id_user, id_friend: id_friend }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("markAsReaded"))
      );
  }

}
