import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ActivityService } from '../activity.service';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  actualTab = "activities";
  isLoged: boolean = false;
  myProfile: boolean = false;
  friendProfile: boolean = false;
  editUserProfile: boolean = false;
  user: User;
  profileOwner: number;
  activities: Activity[];
  actualActivity: Activity;
  activityDetailsInformation: boolean = false;
  action: string = "";
  deleteText: string = "";
  unreadedInvitations = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private activityService: ActivityService,
    private communicationService: CommunicationService,
    private userService: UserService) { }

  ngOnInit(): void {

    this.unreadedInvitations = this.communicationService.unreadedInvitations;
    this.profileOwner = (+this.route.snapshot.paramMap.get('id'));
    this.getUserDetails(this.profileOwner);

    this.authenticationService.logedUser$.subscribe((logedUser) => {
      this.isLoged = logedUser;
      if (this.isLoged) {
        if (this.profileOwner == (+this.authenticationService.userId)) {
          this.myProfile = true;
          this.action = "me";
          this.fetchAllActivitiesForUser(this.profileOwner).subscribe(res => {
            res.sort((n1, n2) => {
              let date1 = this.converTimeToFormatMMDDYYYY(n1.date);
              let date2 = this.converTimeToFormatMMDDYYYY(n2.date);

              let timestamp1 = new Date(date1).valueOf();
              let timestamp2 = new Date(date2).valueOf();
              if (timestamp1 > timestamp2) {
                return -1;
              }
              if (timestamp1 < timestamp2) {
                return 1;
              }
              return 0;
            });
            this.activities = res;
          });
          this.deleteText = `Usunięcie konta spowoduje trwałe usunięcie wszystkich twoich danych
                            oraz informacji powiązanych z
                            twoim kontem!
                            Uwaga!
                            Ta operacja jest nieodwracalna!`;

        } else {

          if (this.communicationService.friends.has(this.profileOwner)) {
            this.friendProfile = true;
            this.action = "friend";
            this.fetchAllActivitiesForUser(this.profileOwner).subscribe(res => {
              res.sort((n1, n2) => {
                let date1 = this.converTimeToFormatMMDDYYYY(n1.date);
                let date2 = this.converTimeToFormatMMDDYYYY(n2.date);

                let timestamp1 = new Date(date1).valueOf();
                let timestamp2 = new Date(date2).valueOf();
                if (timestamp1 > timestamp2) {
                  return -1;
                }
                if (timestamp1 < timestamp2) {
                  return 1;
                }
                return 0;
              });
              this.activities = res;
            });


          } else {

            this.fetchPublicActivitiesForUser(this.profileOwner).subscribe(res => {
              res.sort((n1, n2) => {
                let date1 = this.converTimeToFormatMMDDYYYY(n1.date);
                let date2 = this.converTimeToFormatMMDDYYYY(n2.date);

                let timestamp1 = new Date(date1).valueOf();
                let timestamp2 = new Date(date2).valueOf();
                if (timestamp1 > timestamp2) {
                  return -1;
                }
                if (timestamp1 < timestamp2) {
                  return 1;
                }
                return 0;
              });
              this.activities = res;

              if (this.communicationService.invitations.has(this.profileOwner)) {
                this.action = "invitedMe";
                if (this.communicationService.invitations.get(this.profileOwner).unreaded == 1) {
                  this.communicationService.unreadedInvitations--;
                  this.communicationService.invitations.get(this.profileOwner).unreaded = 0;
                  this.userService.markInvitationAsReaded((+this.authenticationService.userId), this.profileOwner).subscribe();
                }

              } else if (this.communicationService.invitationsSendedByMe.has(this.profileOwner)) {
                this.action = "iInvited";
              } else {
                this.action = "stranger";
              }

            });
          }
        }

      } else {
        this.fetchPublicActivitiesForUser(this.profileOwner).subscribe(res => {
          res.sort((n1, n2) => {
            let date1 = this.converTimeToFormatMMDDYYYY(n1.date);
            let date2 = this.converTimeToFormatMMDDYYYY(n2.date);

            let timestamp1 = new Date(date1).valueOf();
            let timestamp2 = new Date(date2).valueOf();
            if (timestamp1 > timestamp2) {
              return -1;
            }
            if (timestamp1 < timestamp2) {
              return 1;
            }
            return 0;
          });
          this.activities = res;
        });
      }
    });
  }
  private converTimeToFormatMMDDYYYY(date: string): string {
    let splitedDateAndHour = date.split(" ");
    let hours = splitedDateAndHour[1];
    let splitedDate = splitedDateAndHour[0].split("-");
    let day = splitedDate[0];
    let month = splitedDate[1];
    let year = splitedDate[2];
    let newdate = month + "-" + day + "-" + year + " " + hours;
    return newdate;
  }

  ngAfterViewChecked(): void {
    setTimeout(() => {
      this.unreadedInvitations = this.communicationService.unreadedInvitations;
      if (this.communicationService.listHasChanged) {
        if (this.communicationService.friends.has(this.profileOwner)) {
          this.action = "friend"
        } else {
          if (this.communicationService.invitations.has(this.profileOwner)) {
            if (this.action != "invitedMe") {
              this.communicationService.unreadedInvitations--;
              this.communicationService.invitations.get(this.profileOwner).unreaded = 0;
              this.userService.markInvitationAsReaded((+this.authenticationService.userId), this.profileOwner).subscribe();
            }
            this.action = "invitedMe";
          } else if (this.communicationService.invitationsSendedByMe.has(this.profileOwner)) {
            this.action = "iInvited";
          } else {
            this.action = "stranger";
          }
        }

        this.communicationService.listHasChanged = false;
        this.communicationService.invitationListHasChanged = false;
        this.communicationService.invitationByMeListHasChanged = false;
        this.communicationService.friendsListHasChanged = false;
      }
    })
  }

  getUserDetails(id: number): void {
    this.userService.getUserDetails(id).subscribe(user => {
      this.user = user;
      if (this.user === null || this.user === undefined) {
        this.router.navigate(["/"]);
      }
    });
  }

  fetchPublicActivitiesForUser(id): Observable<Activity[]> {
    return this.activityService.fetchPublicActivitiesForUserUnlimited(id);
  }

  fetchAllActivitiesForUser(id): Observable<Activity[]> {
    return this.activityService.fetchAllActivitiesForUserUnlimited(id);
  }

  invite(friend: User): void {
    this.userService.inviteFriend(this.authenticationService.userId, friend.id).subscribe((res) => {
      this.communicationService.sendInvitationToSocket(this.authenticationService.user$, friend);
      this.action = "iInvited";
    })
  }

  acceptInvitation(user: User): void {
    this.userService.acceptInvitation(this.authenticationService.userId, user.id).subscribe(() => {
      this.communicationService.sendAcceptInvitationToSocket(this.authenticationService.user$, user);
      this.communicationService.invitations.delete(user.id);
      this.communicationService.friends.set(user.id, user);
      this.action = "friend";
    });
  }

  declineInvitation(friend_id: number): void {
    this.userService.declineInvitation(this.authenticationService.userId, friend_id).subscribe(() => {
      this.communicationService.sendDeclineInvitationToSocket((+this.authenticationService.userId), friend_id);
      this.communicationService.invitations.delete(friend_id);
      this.action = "stranger";
    });
  }

  cancelInvitation(friend_id: number): void {
    this.userService.declineInvitation(this.authenticationService.userId, friend_id).subscribe(() => {
      this.communicationService.invitationsSendedByMe.delete(friend_id);
      this.communicationService.sendCancelInvitationToSocket((+this.authenticationService.userId), friend_id);
      this.action = "stranger";
    });
  }

  deleteFromFriends(friend_id: number): void {
    this.userService.deleteFriend(this.authenticationService.userId, friend_id).subscribe(() => {
      this.communicationService.sendDeleteFriendToSocket((+this.authenticationService.userId), friend_id);
      this.communicationService.friends.delete(friend_id);
      this.communicationService.peoples.delete(friend_id);
      this.communicationService.messages.delete(friend_id);
      this.action = "stranger";
    });
  }

  showActivities(): void {
    this.actualTab = "activities";
  }

  showDeleteAccount(): void {
    this.actualTab = "settings";
  }

  showFriends(): void {
    this.actualTab = "friends";
  }

  showEditProfile(): void {
    this.editUserProfile = true;
    this.actualTab = "editUserProfile";
  }

  createActivity(): void {
    this.actualTab = "newActivity";
  }

  closeEditProfile(): void {
    this.editUserProfile = false;
    this.actualTab = "activities";
  }

  activityDetails(activity: Activity): void {
    this.actualActivity = activity;
    this.activityDetailsInformation = true;
  }

  closeDetails(): void {
    this.actualActivity = null;
    this.activityDetailsInformation = false;
  }

  refresh(): void {
    this.fetchAllActivitiesForUser(this.profileOwner).subscribe(res => {
      res.sort((n1, n2) => {
        let date1 = this.converTimeToFormatMMDDYYYY(n1.date);
        let date2 = this.converTimeToFormatMMDDYYYY(n2.date);

        let timestamp1 = new Date(date1).valueOf();
        let timestamp2 = new Date(date2).valueOf();
        if (timestamp1 > timestamp2) {
          return -1;
        }
        if (timestamp1 < timestamp2) {
          return 1;
        }
        return 0;
      });
      this.activities = res;
    });
  }

  deleteMyAccount(): void {
    this.userService.deleteAccount(this.authenticationService.userId).subscribe(() => {
      this.authenticationService.logedUser$.next(false);
      this.communicationService.userLogout();
      this.communicationService.deleteSocketConnection();
      this.authenticationService.stopCountdownToRefresh();
      this.communicationService.sendDeletedAccount(+this.authenticationService.userId);
      this.authenticationService.userId = null;
      this.router.navigate(["/"]);
    });
  }

  createdPost(): void {
    this.fetchAllActivitiesForUser(this.profileOwner).subscribe(res => {
      res.sort((n1, n2) => {
        let date1 = this.converTimeToFormatMMDDYYYY(n1.date);
        let date2 = this.converTimeToFormatMMDDYYYY(n2.date);

        let timestamp1 = new Date(date1).valueOf();
        let timestamp2 = new Date(date2).valueOf();
        if (timestamp1 > timestamp2) {
          return -1;
        }
        if (timestamp1 < timestamp2) {
          return 1;
        }
        return 0;
      });
      this.activities = res;
    });
    this.actualTab = "activities";
  }
}
