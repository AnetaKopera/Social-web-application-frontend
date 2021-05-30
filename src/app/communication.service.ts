import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { io } from 'socket.io-client';
import { AuthenticationService } from './authentication.service';
import { ErrorService } from './error.service';
import { Invitation } from './models/Invitation';
import { Message } from './models/Message';
import { User } from './models/User';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  readonly socket = io("http://localhost:3000");
  private url = "http://localhost:3000";
  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  public messages: Map<number, Array<Message>> = new Map();
  public peoples: Map<number, User> = new Map();
  public friends: Map<number, User> = new Map();

  public invitations: Map<number, Invitation> = new Map();
  public invitationsSendedByMe: Map<number, Invitation> = new Map();
  public unreadedInvitations: number = 0;

  public unreadedMessages: number = 0;
  public unreadedMessagesMap: Map<number, number> = new Map();
  public listHasChanged = false;
  public invitationListHasChanged = false;
  public invitationByMeListHasChanged = false;
  public friendsListHasChanged = false;
  public socketConnectionClose = true;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private http: HttpClient,
    private errorService: ErrorService,
    private router: Router) {

    this.socket.on('connect', () => {
      // console.log("socket id ", this.socket.id); 
    });

    this.socket.on('disconnect', (reason) => {
      //console.log("socket id disconnected ", reason, this.socket.id);

      if (this.authenticationService.logedUser$.getValue() && !this.socketConnectionClose) {
        window.location.reload();
      }
    });
  }

  setUpSocketConnection(): void {
    this.socketConnectionClose = false;
    this.socket.emit("new_user", this.authenticationService.userId);
  }

  reconnect(): Observable<{ message: string }> {
    let observable = new Observable<{ message: string }>(observer => {
      this.socket.on('reconnect_needed', (data) => {
        this.socket.emit("new_user", this.authenticationService.userId);
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  myProfileIsDeleted(): Observable<{ user_id: number }> {
    let observable = new Observable<{ user_id: number }>(observer => {
      this.socket.on('profile_deleted', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newMessageReceived(): Observable<{ message: string, sender: number, receiver: number, information: string }> {
    let observable = new Observable<{ message: string, sender: number, receiver: number, information: string }>(observer => {
      this.socket.on('new_message', (data) => {
        if (data.information == "other") {
          if (this.unreadedMessagesMap.has(data.sender)) {
            this.unreadedMessagesMap.set(data.sender, (this.unreadedMessagesMap.get(data.sender) + 1));
            this.unreadedMessages++;
          } else {
            this.unreadedMessagesMap.set(data.sender, 1);
            this.unreadedMessages++;
          }
        }

        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newCommentReceived(): Observable<{ activity: number }> {
    let observable = new Observable<{ activity: number }>(observer => {
      this.socket.on('new_comment', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newCommentDeleted(): Observable<{ activity: number }> {
    let observable = new Observable<{ activity: number }>(observer => {
      this.socket.on('new_comment_deleted', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }


  newInvitationReceived(): Observable<{ user: User, information: string }> {
    let observable = new Observable<{ user: User, information: string }>(observer => {
      this.socket.on('new_invitation', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newCancelInvitationReceived(): Observable<{ id_user: number, information: string }> {
    let observable = new Observable<{ id_user: number, information: string }>(observer => {
      this.socket.on('new_canceled_invitation', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newAcceptInvitationReceived(): Observable<{ user: User, information: string }> {
    let observable = new Observable<{ user: User, information: string }>(observer => {
      this.socket.on('new_accept_invitation', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newDeclineInvitationReceived(): Observable<{ id_user: number, information: string }> {
    let observable = new Observable<{ id_user: number, information: string }>(observer => {
      this.socket.on('new_decline_invitation', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newDeleteFromFriendsReceived(): Observable<{ id_user: number, information: string }> {
    let observable = new Observable<{ id_user: number, information: string }>(observer => {
      this.socket.on('new_deleted_friend', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  newChangeProfile(): Observable<{ user: User }> {
    let observable = new Observable<{ user: User }>(observer => {
      this.socket.on('new_change_profile', (data) => {
        observer.next(data);
        return observable;
      });
    });

    return observable;
  }

  fetchConverstaionPartnersList(id: Pick<User, "id">): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.url}/messages/conversationlist/${id}`, { responseType: "json" })
      .pipe(
        tap((user) => {

          this.messages = new Map();
          this.peoples = new Map();
          this.unreadedMessagesMap = new Map();

          for (let i = 0; i < user.length; i++) {

            let u: User = {
              id: user[i].id,
              name: user[i].name,
              surname: user[i].surname,
              description: user[i].description,
              email: user[i].email,
              password: null,
              photo_path: user[i].photo_path,
              photo_name: user[i].photo_name
            };
            this.peoples.set(user[i].id, u);
            this.unreadedMessagesMap.set(user[i].id, 0);

            this.fetchConversationWithUser(user[i].id, id).subscribe((message_list) => {

              let tmp_messages: Array<Message> = new Array();

              for (let j = 0; j < message_list.length; j++) {

                let m: Message = {
                  id: null,
                  text: message_list[j].text,
                  me_sender: message_list[j].me_sender,
                  send_date: new Date(message_list[j].send_date),

                  unreaded: message_list[j].unreaded,
                }
                tmp_messages.push(m);

                if (m.me_sender == 0 && m.unreaded == 1) {
                  this.unreadedMessagesMap.set(+user[i].id, (this.unreadedMessagesMap.get(+user[i].id) + 1));
                }
              }

              this.messages.set(user[i].id, tmp_messages);
              this.unreadedMessages += this.unreadedMessagesMap.get(user[i].id);

            });
          }
        }),
        catchError(this.errorService.handleError<User[]>("fetchConversationList", []))
      );
  }


  fetchConversationWithUser(id, logedUserID: Pick<User, "id">): Observable<Message[]> {
    return this.http
      .post<Message[]>(`${this.url}/messages/conversationwith/`,
        { id: id, logedUserID: logedUserID },
        this.httpOptions)
      .pipe(
        tap((bbb) => {
        }),
        catchError(this.errorService.handleError<Message[]>("fetchConversationWithUser", []))
      );
  }

  fetchFriends(id: Pick<User, "id">): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.url}/user/getFriends/${id}`, { responseType: "json" })
      .pipe(
        tap((user) => {

          this.friends = new Map();

          for (let i = 0; i < user.length; i++) {

            let u: User = {
              id: user[i].id,
              name: user[i].name,
              surname: user[i].surname,
              description: user[i].description,
              email: user[i].email,
              password: null,
              photo_path: user[i].photo_path,
              photo_name: user[i].photo_name
            };
            this.friends.set(user[i].id, u);

          }

        }),
        catchError(this.errorService.handleError<User[]>("fetchFriends", []))
      );
  }

  deleteSocketConnection(): boolean {
    this.socketConnectionClose = true;
    this.socketOff('new_message');
    this.socketOff('new_comment_deleted');
    this.socketOff('new_invitation');
    this.socketOff('new_canceled_invitation');
    this.socketOff('new_accept_invitation')
    return true;
  }

  sendDeletedAccount(user_id: number): void {
    this.socket.emit('send_delete_account', { user_id: user_id });
  }

  socketOff(eventName: string): boolean {
    this.socket.off(eventName);
    return true;
  }

  sendMessageToSocket(message: string, receiver: number, id: Pick<User, "id">): void {
    this.socket.emit('send_new_message', { message: message, receiver: receiver, sender: id });
  }

  sendCommentToSocket(id_activity): void {
    this.socket.emit('send_new_comment', { activity: id_activity });
  }

  deleteCommentToSocket(id_activity): void {
    this.socket.emit('delete_comment', { activity: id_activity });
  }

  sendInvitationToSocket(user: User, friend: User): void {
    this.socket.emit('send_new_invitation', { user: user, friend: friend });
  }
  sendCancelInvitationToSocket(user_id: number, friend_id: number): void {
    this.socket.emit('send_cancel_invitation', { user_id: user_id, friend_id: friend_id });
  }

  sendAcceptInvitationToSocket(user: User, friend: User): void {
    this.socket.emit('send_accept_invitation', { user: user, friend: friend });
  }

  sendDeclineInvitationToSocket(user_id: number, friend_id: number): void {
    this.socket.emit('send_decline_invitation', { user_id: user_id, friend_id: friend_id });
  }

  sendDeleteFriendToSocket(user_id: number, friend_id: number): void {
    this.socket.emit('send_delete_friend', { user_id: user_id, friend_id: friend_id });
  }

  sendChangeProfileData(user: User) {
    this.socket.emit('send_change_profile', { user: user });
  }

  userLogout(): void {
    localStorage.removeItem("token");
    this.messages = new Map();
    this.peoples = new Map();
    this.unreadedMessagesMap = new Map();
    this.friends = new Map();
    this.invitations = new Map();
    this.invitationsSendedByMe = new Map();
    this.unreadedMessages = 0;
    this.unreadedInvitations = 0;
    this.socket.emit('delete', { message: "delete me", id: this.authenticationService.userId });
  }


  setUpAndGetData(): void {
    this.setUpSocketConnection();

    this.reconnect().subscribe(() => {
      this.socket.emit("new_user", this.authenticationService.userId);
    });
    this.fetchFriends(this.authenticationService.userId).subscribe();

    this.fetchConverstaionPartnersList(this.authenticationService.userId).subscribe(() => {

      this.socketOff("new_message");
      this.newMessageReceived().subscribe(
        result => {
          if (result.information == "other") {
            if (this.messages.has(result.sender)) {

              let messagesWithUser: Message[];
              messagesWithUser = this.messages.get(result.sender);

              let message: Message = {
                text: result.message,
                id: null,
                me_sender: 0,
                send_date: new Date(Date.now()),
                unreaded: 1
              };
              messagesWithUser.push(message);
              this.messages.set(result.sender, messagesWithUser);

            } else {

              let messagesWithUser: Message[] = [];
              let message: Message = {
                text: result.message,
                id: null,
                me_sender: 0,
                send_date: new Date(Date.now()),
                unreaded: 1
              };
              messagesWithUser.push(message);
              this.userService.getUserDetails(result.sender).subscribe(
                (user) => {
                  this.peoples.set(result.sender, user);
                  this.messages.set(result.sender, messagesWithUser);
                });
            }
          }

        });
    });

    this.userService.invitedMeList(this.authenticationService.userId).subscribe((res) => {
      this.invitations = new Map();

      for (let i = 0; i < res.length; i++) {
        this.invitations.set(res[i].id_sender, res[i]);

        if (res[i].unreaded == 1) {
          this.unreadedInvitations++;
        }
      }
    });

    this.userService.iInvitedList(this.authenticationService.userId).subscribe((res) => {
      this.invitationsSendedByMe = new Map();

      for (let i = 0; i < res.length; i++) {
        this.invitationsSendedByMe.set(res[i].id_receiver, res[i]);
      }
    });

    this.socketOff("new_invitation");
    this.newInvitationReceived().subscribe(
      (result) => {
        if (result.information == "other") {
          this.unreadedInvitations++;
          let invitation: Invitation = {
            id: null,
            name: result.user.name,
            surname: result.user.surname,
            description: result.user.description,
            email: result.user.email,
            password: null,
            photo_path: result.user.photo_path,
            photo_name: result.user.photo_name,
            id_sender: result.user.id,
            id_receiver: (+this.authenticationService.userId),
            unreaded: 1,
          }
          this.invitations.set(result.user.id, invitation);
          this.listHasChanged = true;
          this.invitationListHasChanged = true;
        } else {

          let invitation: Invitation = {
            id: null,
            name: result.user.name,
            surname: result.user.surname,
            description: result.user.description,
            email: result.user.email,
            password: null,
            photo_path: result.user.photo_path,
            photo_name: result.user.photo_name,
            id_sender: (+this.authenticationService.userId),
            id_receiver: result.user.id,
            unreaded: null,
          }
          this.invitationsSendedByMe.set(result.user.id, invitation);
          this.listHasChanged = true;
          this.invitationListHasChanged = true;
        }

      }
    );


    this.socketOff('new_canceled_invitation');
    this.newCancelInvitationReceived().subscribe(
      (result) => {
        if (result.information == " other") {
          if (this.invitations.get(result.id_user).unreaded == 1) {
            this.unreadedInvitations--;
          };
          this.invitations.delete(result.id_user);
          this.listHasChanged = true;
          this.invitationListHasChanged = true;
        } else {
          this.invitationsSendedByMe.delete(result.id_user);
          this.listHasChanged = true;
          this.invitationByMeListHasChanged = true;
        }

      }
    );

    this.socketOff('new_accept_invitation');
    this.newAcceptInvitationReceived().subscribe(
      (result) => {
        if (result.information == "other") {

          this.invitationsSendedByMe.delete(result.user.id);
          this.friends.set(result.user.id, result.user);

          this.listHasChanged = true;
          this.invitationByMeListHasChanged = true;
          this.friendsListHasChanged = true;
        } else {

          if (this.invitations.get(result.user.id).unreaded == 1) {
            this.unreadedInvitations--;
          };
          this.invitations.delete(result.user.id);
          this.friends.set(result.user.id, result.user);

          this.listHasChanged = true;
          this.invitationListHasChanged = true;
          this.friendsListHasChanged = true;
        }
      }
    );


    this.socketOff('new_decline_invitation');
    this.newDeclineInvitationReceived().subscribe(
      (result) => {
        if (result.information == "other") {

          this.invitationsSendedByMe.delete(result.id_user);
          this.listHasChanged = true;
          this.invitationByMeListHasChanged = true;
        } else {
          if (this.invitations.get(result.id_user).unreaded == 1) {
            this.unreadedInvitations--;
          };
          this.invitations.delete(result.id_user);
          this.listHasChanged = true;
          this.invitationByMeListHasChanged = true;
        }
      }
    );

    this.socketOff('new_deleted_friend');
    this.newDeleteFromFriendsReceived().subscribe(
      (result) => {
        if (result.information == "other") {
          this.friends.delete(result.id_user);
          this.peoples.delete(result.id_user);
          this.messages.delete(result.id_user);
          this.listHasChanged = true;
          this.friendsListHasChanged = true;
        } else {
          this.friends.delete(result.id_user);
          this.peoples.delete(result.id_user);
          this.messages.delete(result.id_user);
        }
      }
    );


    this.socketOff('new_change_profile');
    this.newChangeProfile().subscribe(
      (result) => {
        if (this.friends.has(result.user.id)) {
          this.friends.set(result.user.id, result.user);
        }

        if (this.peoples.has(result.user.id)) {
          this.peoples.set(result.user.id, result.user);
        }

        if (result.user.id == +this.authenticationService.userId) {
          this.authenticationService.user$ = result.user;
        }
      }
    )

    this.socketOff('profile_deleted');
    this.myProfileIsDeleted().subscribe(
      (result) => {
        this.authenticationService.logedUser$.next(false);
        this.authenticationService.stopCountdownToRefresh();
        this.deleteSocketConnection();
        this.userLogout();
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(["login"]);
      }
    )

  }

}
