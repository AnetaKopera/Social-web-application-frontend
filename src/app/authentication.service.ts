import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { User } from "../app/models/User";
import { BehaviorSubject, Observable } from 'rxjs';
import { first, catchError, tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private url: string = "http://localhost:3000/authentication";
  logedUser$ = new BehaviorSubject<boolean>(false);
  userId: Pick<User, "id">;
  user$: User;
  tokenExpiration: number;
  expirationTimer;

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  }

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private errorService: ErrorService,
    private router: Router) { }

  signup(user: Omit<User, "id">): Observable<{ userId: Pick<User, "id">, token: string, expiration: number }> {
    return this.http.post(`${this.url}/signup`, user, this.httpOptions).pipe(
      first(),

      tap((tokenObject: { userId: Pick<User, "id">, token: string, expiration: number }) => {
        this.userId = tokenObject.userId;
        this.logedUser$.next(true);
        this.tokenExpiration = tokenObject.expiration;
        localStorage.setItem("token", tokenObject.token);
        this.startCountdownToRefresh();

        this.userService.getUserDetails(this.userId).subscribe((user) => {
          this.user$ = user;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.navigate(["/"]);
        });

      }),

      catchError(this.errorService.handleError<{ userId: Pick<User, "id">, token: string, expiration: number }>("signup"))
    );
  }

  login(email: Pick<User, "email">, password: Pick<User, "password">): Observable<{ userId: Pick<User, "id">, token: string, expiration: number }> {
    return this.http.post(`${this.url}/login`, { email: email, password: password }, this.httpOptions)
      .pipe(
        first(),
        tap((tokenObject: { userId: Pick<User, "id">, token: string, expiration: number }) => {
          this.userId = tokenObject.userId;
          localStorage.setItem("token", tokenObject.token);
          this.logedUser$.next(true);
          this.tokenExpiration = tokenObject.expiration;
          this.startCountdownToRefresh();

          this.userService.getUserDetails(this.userId).subscribe((user) => {
            this.user$ = user;
          });

        }),
        catchError(
          this.errorService.handleError<{ userId: Pick<User, "id">, token: string, expiration: number }>("login")
        )
      );
  }

  checkIfTokenExist(): Observable<{ userId: Pick<User, "id">, token: string, expiration: number }> {
    let token = localStorage.getItem("token");

    return this.http.post(`${this.url}/check_token`, { token: token }, this.httpOptions)
      .pipe(
        first(),
        tap((result: { userId: Pick<User, "id">, token: string, expiration: number }) => {

          if (result.userId != null && result.userId != undefined) {
            this.tokenExpiration = result.expiration;
            this.startCountdownToRefresh();

          } else {
            localStorage.removeItem("token");
          }
        }),
        catchError(this.errorService.handleError<{ userId: Pick<User, "id">, token: string, expiration: number }>("checkIfTokenExist"))
      );
  }

  refreshToken(): Observable<{ userId: Pick<User, "id">, token: string, expiration: number }> {
    let token = localStorage.getItem("token");
    localStorage.removeItem("token");

    return this.http.post(`${this.url}/refresh_token`, { token: token }, this.httpOptions).pipe(
      first(),
      tap((result: { userId: Pick<User, "id">, token: string, expiration: number }) => {
        if (result.userId != null) {
          this.tokenExpiration = result.expiration;
          localStorage.setItem("token", result.token);
          this.startCountdownToRefresh();
        } else {
          this.stopCountdownToRefresh();
          window.location.reload();
        }
      }),
      catchError(this.errorService.handleError<{ userId: Pick<User, "id">, token: string, expiration: number }>("checkIfTokenExist")
      )
    );
  }

  startCountdownToRefresh() {
    let expires = new Date(this.tokenExpiration * 1000);
    let delay = expires.getTime() - Date.now() - (60 * 1000);
    this.expirationTimer = setTimeout(() => this.refreshToken().subscribe(() => { }), delay);
  }

  stopCountdownToRefresh() {
    clearTimeout(this.expirationTimer);
  }
}
