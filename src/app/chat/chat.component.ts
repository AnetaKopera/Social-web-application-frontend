import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';
import { MessageService } from '../message.service';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { UserService } from '../user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  message: string;
  newConversationEnabled: boolean = false;
  searchFriend: string;
  isLoged: boolean = false;
  actualReceiverId: number;
  actualUser: User;
  friends1$;
  messagesWithUser$;
  matchingFriends$ = [];
  disableScrollDown: boolean = false;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private communicationService: CommunicationService,
    private userService: UserService,
    private router: Router) {

    this.communicationService.socketOff("new_message");

    this.communicationService.newMessageReceived()
      .subscribe(data => {
        if (data.information == "other") {
          if (this.communicationService.messages.has(data.sender)) {

            let messagesWithSender: Message[];
            messagesWithSender = this.communicationService.messages.get(data.sender);
            let newMessage: Message = {
              text: data.message,
              id: null,
              me_sender: 0,
              send_date: new Date(Date.now()),
              unreaded: 1,
            };
            messagesWithSender.push(newMessage);
            this.communicationService.messages.set(data.sender, messagesWithSender);

            if (data.sender == this.actualReceiverId) {
              this.messagesWithUser$ = this.communicationService.messages.get(data.sender);
            }
            let tmp_friends = [];

            this.communicationService.peoples.forEach((value: User, key: number) => {
  
              tmp_friends.push([value, this.communicationService.messages.get(key)[this.communicationService.messages.get(key).length - 1].send_date,
                this.communicationService.unreadedMessagesMap.get(key)]);
            });
            tmp_friends.sort((n1, n2) => {
  
              let timestamp1 = new Date(n1[1]).valueOf();
              let timestamp2 = new Date(n2[1]).valueOf();
              if (timestamp1 > timestamp2) {
                return -1;
              }
              if (timestamp1 < timestamp2) {
                return 1;
              }
              return 0;
            });
  
            this.friends1$ = tmp_friends;

          } else {

            let messagesWithSender: Message[] = [];
            let newMessage: Message = {
              text: data.message,
              id: null,
              me_sender: 0,
              send_date: new Date(Date.now()),
              unreaded: 1,
            };
            messagesWithSender.push(newMessage);
            this.userService.getUserDetails(data.sender).subscribe(
              (user) => {
                this.communicationService.peoples.set(data.sender, user);
                this.communicationService.messages.set(data.sender, messagesWithSender);

                let tmp_friends = [];

                this.communicationService.peoples.forEach((value: User, key: number) => {
      
                  tmp_friends.push([value, this.communicationService.messages.get(key)[this.communicationService.messages.get(key).length - 1].send_date,
                    this.communicationService.unreadedMessagesMap.get(key)]);
                });
                tmp_friends.sort((n1, n2) => {
      
                  let timestamp1 = new Date(n1[1]).valueOf();
                  let timestamp2 = new Date(n2[1]).valueOf();
                  if (timestamp1 > timestamp2) {
                    return -1;
                  }
                  if (timestamp1 < timestamp2) {
                    return 1;
                  }
                  return 0;
                });
      
                this.friends1$ = tmp_friends;
              });
          }

         

       
        } else {
          if (this.communicationService.messages.has(data.receiver)) {

            let messagesWithReceiver: Message[];
            messagesWithReceiver = this.communicationService.messages.get(data.receiver);
            let newMessage: Message = {
              text: data.message,
              id: null,
              me_sender: 1,
              send_date: new Date(Date.now()),
              unreaded: 1,
            };
            messagesWithReceiver.push(newMessage);
            this.communicationService.messages.set(data.receiver, messagesWithReceiver);

            if (data.receiver == this.actualReceiverId) {
              this.messagesWithUser$ = this.communicationService.messages.get(data.receiver);
            }

          } else {

            let messagesWithReceiver: Message[] = [];
            let newMessage: Message = {
              text: data.message,
              id: null,
              me_sender: 1,
              send_date: new Date(Date.now()),
              unreaded: 1,
            };
            messagesWithReceiver.push(newMessage);
            this.userService.getUserDetails(data.receiver).subscribe(
              (user) => {
                this.communicationService.peoples.set(data.receiver, user);
                this.communicationService.messages.set(data.receiver, messagesWithReceiver);
              });
          }

          let tmp_friends = [];

          this.communicationService.peoples.forEach((value: User, key: number) => {
            tmp_friends.push([value, this.communicationService.messages.get(key)[this.communicationService.messages.get(key).length - 1].send_date, this.communicationService.unreadedMessagesMap.get(key)]);
          });

          tmp_friends.sort((n1, n2) => {
            let timestamp1 = new Date(n1[1]).valueOf();
            let timestamp2 = new Date(n2[1]).valueOf();
            if (timestamp1 > timestamp2) {
              return -1;
            }
            if (timestamp1 < timestamp2) {
              return 1;
            }
            return 0;
          });

          this.friends1$ = tmp_friends;
        }

      });

  }

  ngOnInit(): void {

    this.authenticationService.logedUser$.subscribe((logedUser) => {
      this.isLoged = logedUser;
      if (this.isLoged) {
        let tmp_friends = [];
        this.communicationService.peoples.forEach((value: User, key: number) => {
          tmp_friends.push([value, this.communicationService.messages.get(key)[this.communicationService.messages.get(key).length - 1].send_date, this.communicationService.unreadedMessagesMap.get(key)]);
        });
        tmp_friends.sort((n1, n2) => {

          let timestamp1 = new Date(n1[1]).valueOf();
          let timestamp2 = new Date(n2[1]).valueOf();
          if (timestamp1 > timestamp2) {
            return -1;
          }
          if (timestamp1 < timestamp2) {
            return 1;
          }
          return 0;
        });

        this.friends1$ = tmp_friends;

      } else {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(["activities/"]);
      }

    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onScroll(): void {
    let element = this.myScrollContainer.nativeElement;
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    if (this.disableScrollDown && atBottom) {
      this.disableScrollDown = false;
    } else if (this.disableScrollDown == false && !atBottom) {
      this.disableScrollDown = true;
    }
  }

  scrollToBottom(): void {
    if (this.disableScrollDown) {
      return
    }
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  sendMessage(): void {
    if (this.message !== undefined) {
      if (this.message.trim() !== '') {

        this.messageService.sendMessage(this.message, this.actualReceiverId, this.authenticationService.userId).subscribe(() => {

          let unreadedForUser = this.communicationService.unreadedMessagesMap.get(this.actualReceiverId);
          if (unreadedForUser != undefined && unreadedForUser != 0) {
            this.messageService.markAsReaded(this.authenticationService.userId, this.actualReceiverId).subscribe(() => {
              this.communicationService.unreadedMessages -= unreadedForUser;
              this.communicationService.unreadedMessagesMap.set(this.actualReceiverId, 0);

              for (let i = 0; i < this.friends1$.length; i++) {
                if (this.friends1$[i][0].id == this.actualReceiverId) {
                  this.friends1$[i][2] = 0;
                  break;
                }
              }

            });
          }

          this.communicationService.sendMessageToSocket(this.message, this.actualReceiverId, this.authenticationService.userId);
          let messagesWithActualReceiver: Message[] = [];

          if (!this.communicationService.peoples.has(this.actualReceiverId)) {
            this.userService.getUserDetails(this.actualReceiverId).subscribe(
              (user) => {
                this.communicationService.peoples.set(this.actualReceiverId, user);

                if (this.communicationService.messages.has(this.actualReceiverId)) {
                  messagesWithActualReceiver = this.communicationService.messages.get(this.actualReceiverId);
                }

                let newMessage: Message = {
                  text: this.message,
                  id: null,
                  me_sender: 1,
                  send_date: new Date(Date.now()),
                  unreaded: 1,
                };

                messagesWithActualReceiver.push(newMessage);
                this.communicationService.messages.set(this.actualReceiverId, messagesWithActualReceiver);

                this.messagesWithUser$ = this.communicationService.messages.get(this.actualReceiverId);

                this.message = "";

                let tmp_friends = [];

                this.communicationService.peoples.forEach((value: User, key: number) => {

                  tmp_friends.push([value, this.communicationService.messages.get(key)[this.communicationService.messages.get(key).length - 1].send_date, this.communicationService.unreadedMessagesMap.get(key)]);
                });
                tmp_friends.sort((n1, n2) => {

                  let timestamp1 = new Date(n1[1]).valueOf();
                  let timestamp2 = new Date(n2[1]).valueOf();
                  if (timestamp1 > timestamp2) {
                    return -1;
                  }
                  if (timestamp1 < timestamp2) {
                    return 1;
                  }
                  return 0;
                });

                this.friends1$ = tmp_friends;

              });

          } else {
            if (this.communicationService.messages.has(this.actualReceiverId)) {
              messagesWithActualReceiver = this.communicationService.messages.get(this.actualReceiverId);
            }

            let newMessage: Message = {
              text: this.message,
              id: null,
              me_sender: 1,
              send_date: new Date(Date.now()),
              unreaded: 1,
            };

            messagesWithActualReceiver.push(newMessage);
            this.communicationService.messages.set(this.actualReceiverId, messagesWithActualReceiver);

            this.messagesWithUser$ = this.communicationService.messages.get(this.actualReceiverId);

            this.message = "";

            let tmp_friends = [];

            this.communicationService.peoples.forEach((value: User, key: number) => {

              tmp_friends.push([value, this.communicationService.messages.get(key)[this.communicationService.messages.get(key).length - 1].send_date, this.communicationService.unreadedMessagesMap.get(key)]);
            });
            tmp_friends.sort((n1, n2) => {

              let timestamp1 = new Date(n1[1]).valueOf();
              let timestamp2 = new Date(n2[1]).valueOf();
              if (timestamp1 > timestamp2) {
                return -1;
              }
              if (timestamp1 < timestamp2) {
                return 1;
              }
              return 0;
            });

            this.friends1$ = tmp_friends;

          }
        });
      }
    }

  }

  userProfile(owner_id: number): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let link = "user/ " + owner_id;
    this.router.navigate([link]);
  }

  conversation(id: number): void {
    this.disableScrollDown = false;
    this.messagesWithUser$ = this.communicationService.messages.get(id);
    this.actualUser = this.communicationService.peoples.get(id);
    this.actualReceiverId = id;
    let unreadedForUser = this.communicationService.unreadedMessagesMap.get(id);

    if (unreadedForUser != undefined && unreadedForUser != 0) {
      this.messageService.markAsReaded(this.authenticationService.userId, this.actualReceiverId).subscribe(() => {
        this.communicationService.unreadedMessages -= unreadedForUser;
        this.communicationService.unreadedMessagesMap.set(id, 0);

        for (let i = 0; i < this.friends1$.length; i++) {
          if (this.friends1$[i][0].id == id) {
            this.friends1$[i][2] = 0;
            break;
          }
        }

      });
    }
  }

  newConversation(): void {
    this.newConversationEnabled = true;
  }

  filterByValue(map, string) {
    let new_array = [];
    string = string.toLowerCase();

    map.forEach((value: User, key: number) => {
      let name_surname = value.name.toLowerCase() + " " + value.surname.toLowerCase();
      if ((value.name).includes(string)) {
        new_array.push(value);
      } else if ((value.surname).includes(string)) {
        new_array.push(value);
      } else if ((name_surname).includes(string)) {
        new_array.push(value);
      }

    });
    return new_array;
  }


  newConversationSearch(): void {
    let matchingFriends = [];
    if (this.searchFriend != undefined) {
      if (this.searchFriend.trim().length > 0) {
        matchingFriends = this.filterByValue(this.communicationService.friends, this.searchFriend.trim().toLowerCase());
        matchingFriends.sort((friend1, friend2) => {
          if (friend1.name < friend2.name) {
            return -1;
          }
          if (friend1.name > friend2.name) {
            return 1;
          }

          if (friend1.surname < friend2.surname) {
            return -1;
          }
          if (friend1.surname > friend2.surname) {
            return 1;
          }

          return 0;
        });
        this.matchingFriends$ = matchingFriends;
        this.searchFriend = "";
      }
    }
  }

  newConversationSelected(choosedFriendId): void {
    if (this.communicationService.peoples.has(choosedFriendId)) {
      this.conversation(choosedFriendId);
      this.closeSearching();

    } else {
      this.messagesWithUser$ = null;
      this.actualReceiverId = choosedFriendId;
      this.actualUser = this.communicationService.friends.get(choosedFriendId);
      this.friends1$.unshift([this.actualUser, []]);
      this.closeSearching();
    }
  }

  closeSearching(): void {
    this.searchFriend = "";
    this.newConversationEnabled = false;
    this.matchingFriends$ = null;
  }

}
