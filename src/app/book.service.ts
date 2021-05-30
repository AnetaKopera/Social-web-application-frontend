import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Book } from "../app/models/Book"
import { ErrorService } from "./error.service";

@Injectable({
  providedIn: "root",
})
export class BookService {
  private url = "http://localhost:3000/books";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService) { }

  fetchRanking(): Observable<Book[]> {
    return this.http
      .get<Book[]>(this.url, { responseType: "json" })
      .pipe(
        tap(),
        catchError(this.errorService.handleError<Book[]>("fetchRanking", []))
      );
  }

  findByTitle(title: string): Observable<Book[]> {
    return this.http
      .post<Book[]>(this.url, { title: title }, { responseType: "json" })
      .pipe(
        tap(),
        catchError(this.errorService.handleError<Book[]>("findByTitle", []))
      );
  }

  getBook(id: number): Observable<Book> {
    const url = `${this.url}/${id}`;
    return this.http.get<Book>(url).pipe(
      tap(),
      catchError(this.errorService.handleError<Book>(`getBook id=${id}`))
    );
  }

}