import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { Activity } from './models/Activity';

@Injectable({
  providedIn: 'root'
})

export class ActivityService {
  private url = "http://localhost:3000/activities";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private http: HttpClient,
    private errorService: ErrorService) { }

  fetchPublicActivities(): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(this.url, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchPublicActivities", []))
      );
  }

  fetchPublicActivitiesUnlimited(): Observable<Activity[]> {
    return this.http
      .get<Activity[]>(`${this.url}/unlimited`, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchPublicActivities", []))
      );
  }

  fetchPublicActivitiesForUser(id: number): Observable<Activity[]> {
    return this.http
      .post<Activity[]>(`${this.url}/public_activities`, { id_user: id }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchPublicActivitiesForUser", []))
      );
  }

  fetchPublicActivitiesForUserUnlimited(id: number): Observable<Activity[]> {
    return this.http
      .post<Activity[]>(`${this.url}/unlimited/public_activities`, { id_user: id }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchPublicActivitiesForUser", []))
      );
  }

  fetchAllActivitiesForUser(id: number): Observable<Activity[]> {
    return this.http
      .post<Activity[]>(`${this.url}/all_activities`, { id_user: id }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchAllActivitiesForUser", []))
      );
  }

  fetchAllActivitiesForUserUnlimited(id: number): Observable<Activity[]> {
    return this.http
      .post<Activity[]>(`${this.url}/unlimited/all_activities`, { id_user: id }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchAllActivitiesForUser", []))
      );
  }

  fetchFriendAtivities(idFriend): Observable<Activity[]> {
    return this.http
      .post<Activity[]>(`${this.url}/friend`, { idFriend: idFriend }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchFriendAtivities", []))
      );
  }

  fetchFriendAtivitiesUnlimited(idFriend): Observable<Activity[]> {
    return this.http
      .post<Activity[]>(`${this.url}/unlimited/friend`, { idFriend: idFriend }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("fetchFriendAtivities", []))
      );
  }

  getActivity(id): Observable<Activity> {
    return this.http
      .post<Activity>(`${this.url}/getDetails`, { id: id }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity>("getCommegetActivityntsOfActivity"))
      );
  }

  getCommentsOfActivity(idActivity: number) {
    return this.http
      .post<Activity[]>(`${this.url}/comments`, { idActivity: idActivity }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity[]>("getCommentsOfActivity", []))
      );
  }

  saveComment(idOwner, idActivity, comment): Observable<Activity> {
    return this.http
      .post<Activity>(`${this.url}/save_comment`, { idOwner: idOwner, idActivity: idActivity, comment: comment }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity>("saveComment"))
      );
  }

  getAllActivityTypes(): Observable<[]> {
    return this.http
      .get<[]>(`${this.url}/getActivityTypes`, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<[]>("getAllActivitiesTypes", []))
      );
  }

  postActivity(idBook: number, text: string, typeOfActivity, owner, visibility): Observable<Activity> {
    return this.http
      .post<Activity>(`${this.url}`, { id_book: idBook, description: text, id_type_of_activity: typeOfActivity, id_owner: owner, visibility: visibility }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity>("postActivity"))
      );
  }

  postActivityWithGrade(idBook: number, text: string, typeOfActivity, grade, owner, visibility): Observable<Activity> {
    return this.http
      .post<Activity>(`${this.url}`, { id_book: idBook, description: text, id_type_of_activity: typeOfActivity, grade: grade, id_owner: owner, visibility: visibility }, { responseType: "json" })
      .pipe(
        tap(response => {
        }),
        catchError(this.errorService.handleError<Activity>("postActivity"))
      );
  }

  deleteActivity(id): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/delete`, { id: id }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("deleteActivity"))
      );
  }

  deleteComment(id): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/delete_comment`, { id: id }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("deleteComment"))
      );
  }

  reportComment(id): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/report_comment`, { id: id }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("reportComment"))
      );
  }

  editComment(idComment, text): Observable<Activity> {
    return this.http
      .post<Activity>(`${this.url}/edit_comment`, { comment_id: idComment, text: text }, { responseType: "json" })
      .pipe(
        tap(),
        catchError(this.errorService.handleError<Activity>("editComment"))
      );
  }

  reportActivity(id): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/report_activity`, { id: id }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("reportActivity"))
      );
  }
}
