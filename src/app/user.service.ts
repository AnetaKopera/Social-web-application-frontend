import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { Invitation } from './models/Invitation';
import { User } from './models/User';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  private url = "http://localhost:3000";

  constructor(
    private http: HttpClient,
    private errorService: ErrorService) { }

  getUserDetails(id): Observable<User> {
    return this.http
      .get<User>(`${this.url}/user/information/${id}`, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("getUserDetails"))
      );
  }

  updateName(idUser, name): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/update_name`, { user_id: idUser, name: name }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("updateName"))
      );
  }

  updateSurname(idUser, surname): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/update_surname`, { user_id: idUser, surname: surname }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("updateSurname"))
      );
  }

  updateNameAndSurname(idUser, name, surname): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/update_name_surname`, { user_id: idUser, name: name, surname: surname }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("updateNameAndSurname"))
      );
  }

  updateDescription(idUser, description): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/update_description`, { user_id: idUser, description: description }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("updateDescription"))
      );
  }

  deleteDescription(idUser): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/delete_description`, { user_id: idUser }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("deleteDescription"))
      );
  }

  updatePassword(id, oldPassword, newPassword): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/user/update_password`, { id: id, old_password: oldPassword, new_password: newPassword }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("updatePassword"))
      );
  }

  updateEmail(idUser, email): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/update_email`, { user_id: idUser, email: email }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("updateEmail"))
      );
  }

  updatePicture(formData): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/update_picture`, formData, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("updatePicture"))
      );
  }

  deletePicture(user_id: number, photo_path: string, photo_name: string): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/user/delete_picture`, { user_id: user_id, photo_path: photo_path, photo_name: photo_name }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("deletePicture"))
      );

  }

  markInvitationsAsReaded(user_id: number): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/user/invitations_readed/`, { user_id: user_id }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("markInvitationsAsReaded"))
      );
  }

  markInvitationAsReaded(user_id: number, friend_id: number): Observable<[]> {
    return this.http
      .post<[]>(`${this.url}/user/invitation_readed/`, { user_id: user_id, friend_id: friend_id }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<[]>("markInvitationAsReaded"))
      );
  }

  inviteFriend(idUser, idFriend): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/invite`, { user_id: idUser, friend_id: idFriend }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("inviteFriend"))
      );
  }

  acceptInvitation(idUser, idFriend): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/accept_invitation`, { user_id: idUser, friend_id: idFriend }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("acceptInvitation"))
      );
  }

  declineInvitation(idUser, idFriend): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/decline_invitation`, { user_id: idUser, friend_id: idFriend }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("declineInvitation"))
      );
  }

  invitedMeList(idUser): Observable<Invitation[]> {
    return this.http
      .post<Invitation[]>(`${this.url}/user/invited_me_list`, { user_id: idUser }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<Invitation[]>("invitedMeList"))
      );
  }

  iInvitedList(idUser): Observable<Invitation[]> {
    return this.http
      .post<Invitation[]>(`${this.url}/user/i_invited_list`, { user_id: idUser }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<Invitation[]>("iInvitedList"))
      );
  }

  deleteFriend(idUser, idFriend): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/delete_friend`, { user_id: idUser, friend_id: idFriend }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("deleteFriend"))
      );
  }

  deleteAccount(idUser): Observable<User> {
    return this.http
      .post<User>(`${this.url}/user/delete_account`, { user_id: idUser }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User>("deleteAccount"))
      );
  }

  getMatchingStrangers(idUser, stranger): Observable<User[]> {
    return this.http
      .post<User[]>(`${this.url}/user/get_matching_strangers`, { user_id: idUser, stranger: stranger }, { responseType: "json" })
      .pipe(
        tap(() => { }),
        catchError(this.errorService.handleError<User[]>("getMatchingStranger"))
      );
  }

}
