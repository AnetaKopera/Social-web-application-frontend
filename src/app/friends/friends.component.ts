import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';
import { Invitation } from '../models/Invitation';
import { User } from '../models/User';
import { UserService } from '../user.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  peoplesAlfabetically = [];
  searchResult = [];
  searchStrangerResult = [];
  actualTab: string;
  searchForm: FormGroup;
  searchStrangerForm: FormGroup;
  active_search: boolean = false;
  unreadedInvitations = 0;
  @ViewChild('formDirective') private formDirective: NgForm;
  @ViewChild('searchStrangerFormDirective') private searchStrangerFormDirective: NgForm;

  constructor(
    private router: Router,
    private communicationService: CommunicationService,
    private authenticationService: AuthenticationService,
    private userService: UserService) { }

  ngOnInit(): void {
    this.getFriendsList();
    this.unreadedInvitations = this.communicationService.unreadedInvitations;
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.unreadedInvitations = this.communicationService.unreadedInvitations;
      if (this.communicationService.listHasChanged) {

        if (this.actualTab == 'allFriends' && this.communicationService.friendsListHasChanged) {
          this.getFriendsList();
        } else if (this.actualTab == 'allInvitations' && this.communicationService.invitationListHasChanged) {
          this.getInvitationsList();
        } else if (this.actualTab == 'allIInvitedList' && this.communicationService.invitationByMeListHasChanged) {
          this.getIInvitedList();
        }

        this.communicationService.listHasChanged = false;
        this.communicationService.invitationListHasChanged = false;
        this.communicationService.invitationByMeListHasChanged = false;
        this.communicationService.friendsListHasChanged = false;
      }
    })
  }

  getFriendsList(): void {
    this.active_search = false;
    this.searchForm = this.createFormGroup();

    this.actualTab = "allFriends";
    let friends_list = [];

    this.communicationService.friends.forEach((value: User, key: number) => {
      friends_list.push(value);
    });

    friends_list.sort((user1, user2) => {
      if (user1.name < user2.name) {
        return -1;
      }
      if (user1.name > user2.name) {
        return 1;
      }
      return 0;
    });

    this.peoplesAlfabetically = friends_list;
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      friend_name: new FormControl("", [Validators.required, Validators.minLength(1)]),
    });
  }

  createStrangerFormGroup(): FormGroup {
    return new FormGroup({
      stranger_name: new FormControl("", [Validators.required, Validators.minLength(1)]),
    });
  }

  filterByValue(array, string) {
    let new_array = [];
    string = string.toLowerCase();

    for (let i = 0; i < array.length; i++) {
      let name_surname = array[i].name.toLowerCase() + " " + array[i].surname.toLowerCase();
      if (array[i].name.includes(string)) {
        new_array.push(array[i]);
      } else if (array[i].surname.includes(string)) {
        new_array.push(array[i]);
      } else if (name_surname.includes(string)) {
        new_array.push(array[i]);
      }

    }
    return new_array;
  }

  search(): void {
    this.active_search = true;
    let seraching_name = (this.searchForm.value.friend_name).trim().toLowerCase();

    if (seraching_name.length > 0) {
      this.searchResult = this.filterByValue(this.peoplesAlfabetically, seraching_name);
    }
  }

  closeSearching(): void {
    this.formDirective.resetForm();
    this.active_search = false;
  }

  getInvitationsList(): void {
    this.actualTab = "allInvitations";

    this.communicationService.unreadedInvitations = 0;
    this.userService.markInvitationsAsReaded((+this.authenticationService.userId)).subscribe();

    let invitations_list = [];
    this.communicationService.invitations.forEach((value: Invitation, key: number) => {
      value.unreaded = 0;
      invitations_list.push(value);
    });

    invitations_list.sort((user1, user2) => {
      if (user1.name < user2.name) {
        return -1;
      }
      if (user1.name > user2.name) {
        return 1;
      }
      return 0;
    });

    this.peoplesAlfabetically = invitations_list;

  }

  getIInvitedList(): void {
    this.actualTab = "allIInvitedList";
    let invitations_list = [];

    this.communicationService.invitationsSendedByMe.forEach((value: User, key: number) => {
      invitations_list.push(value);
    });

    invitations_list.sort((user1, user2) => {
      if (user1.name < user2.name) {
        return -1;
      }
      if (user1.name > user2.name) {
        return 1;
      }
      return 0;
    });

    this.peoplesAlfabetically = invitations_list;
  }

  getNewFriends(): void {
    this.actualTab = "getNewFriends";
    this.searchStrangerResult = [];
    this.searchStrangerForm = this.createStrangerFormGroup();
  }

  searchStranger(): void {
    let name = this.searchStrangerForm.value.stranger_name.trim();
    if (name != null && name != undefined) {
      if (name.length > 0) {
        this.userService.getMatchingStrangers(this.authenticationService.userId, name).subscribe((res) => {
          this.searchStrangerResult = res;
        });
      }
    }
  }

  deleteFromFriends(friend_id: number): void {
    this.userService.deleteFriend(this.authenticationService.userId, friend_id).subscribe(() => {
      this.communicationService.sendDeleteFriendToSocket((+this.authenticationService.userId), friend_id);
      this.communicationService.friends.delete(friend_id);
      this.communicationService.peoples.delete(friend_id);
      this.communicationService.messages.delete(friend_id);
      this.getFriendsList();
    });
  }

  userProfile(friend_id: number): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let link = "user/ " + friend_id;
    this.router.navigate([link]);
  }

  invite(friend: User): void {
    this.userService.inviteFriend(this.authenticationService.userId, friend.id).subscribe(() => {
      this.searchStrangerFormDirective.resetForm();
      this.communicationService.sendInvitationToSocket(this.authenticationService.user$, friend);

      let invitation: Invitation = {
        id: null,
        name: friend.name,
        surname: friend.surname,
        description: friend.description,
        email: friend.email,
        password: null,
        photo_path: friend.photo_path,
        photo_name: friend.photo_name,
        id_sender: (+this.authenticationService.userId),
        id_receiver: friend.id,
        unreaded: null,
      }
      this.communicationService.invitationsSendedByMe.set(friend.id, invitation);
      this.getIInvitedList();

    })
  }

  acceptInvitation(invitation: Invitation): void {
    this.userService.acceptInvitation(this.authenticationService.userId, invitation.id_sender).subscribe(() => {

      let friend: User = {
        id: invitation.id_sender,
        name: invitation.name,
        surname: invitation.surname,
        description: invitation.description,
        email: invitation.email,
        password: null,
        photo_path: invitation.photo_path,
        photo_name: invitation.photo_name,
      }

      this.communicationService.sendAcceptInvitationToSocket(this.authenticationService.user$, friend);
      this.communicationService.invitations.delete(invitation.id_sender);
      this.getInvitationsList();
      this.communicationService.friends.set(friend.id, friend);
    });
  }

  declineInvitation(friend_id: number): void {
    this.userService.declineInvitation(this.authenticationService.userId, friend_id).subscribe(() => {
      this.communicationService.sendDeclineInvitationToSocket((+this.authenticationService.userId), friend_id);
      this.communicationService.invitations.delete(friend_id);
      this.getInvitationsList();
    });
  }

  cancelInvitation(friend_id: number): void {
    this.userService.declineInvitation(this.authenticationService.userId, friend_id).subscribe(() => {
      this.communicationService.invitationsSendedByMe.delete(friend_id);
      this.communicationService.sendCancelInvitationToSocket((+this.authenticationService.userId), friend_id);
      this.getIInvitedList();
    });
  }
}
