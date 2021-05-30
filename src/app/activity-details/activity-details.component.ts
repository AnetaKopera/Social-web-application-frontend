import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ActivityService } from '../activity.service';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';
import { Activity } from '../models/Activity';
import { User } from '../models/User';

@Component({
  selector: 'app-activity-details',
  templateUrl: './activity-details.component.html',
  styleUrls: ['./activity-details.component.scss']
})
export class ActivityDetailsComponent implements OnInit {

  isLoged: boolean = false;
  logedUserDetails: User;
  logedUserId: number = null;
  comments$ = [];
  optionsClicked: boolean[] = [];
  user_comment: string = "";
  newComment: boolean;
  options = [["Usuń", "delete"], ["Zgłoś", "report"], ["Kopiuj link", "copy_link"], ["Przejdź do aktywności", "go_to_activity"]];
  actualOptions$ = [];
  optionsVisibility: boolean = false;

  @Input('activity') actualActivity: Activity;
  @Input('goToActivity') goToActivity: boolean;
  @Output() closeActivityDetails: EventEmitter<any> = new EventEmitter();
  @Output() closerefreshActivityDetails: EventEmitter<any> = new EventEmitter();

  constructor(
    private activityService: ActivityService,
    private authenticationService: AuthenticationService,
    private communicationService: CommunicationService,
    private router: Router) {

    this.communicationService.socketOff("new_comment");
    this.communicationService.newCommentReceived().subscribe(data => {

      if (this.actualActivity !== undefined && this.actualActivity !== null) {
        if (data.activity == this.actualActivity.id) {
          this.newComment = true;
          this.activityService.getCommentsOfActivity(this.actualActivity.id).subscribe(response => {
            this.comments$ = response;
            this.optionsClicked = [];
            for (let i = 0; i < this.comments$.length; i++) {
              this.optionsClicked.push(false);
            }
          });
        }
      }
    });

    this.communicationService.socketOff("new_comment_deleted");
    this.communicationService.newCommentDeleted().subscribe(data => {
      if (this.actualActivity !== undefined && this.actualActivity !== null) {
        if (data.activity == this.actualActivity.id) {
          this.newComment = true;
          this.activityService.getCommentsOfActivity(this.actualActivity.id).subscribe(response => {
            this.comments$ = response;
            this.optionsClicked = [];
            for (let i = 0; i < this.comments$.length; i++) {
              this.optionsClicked.push(false);
            }
          });
        }
      }
    });
  }

  ngOnInit(): void {

    if (this.actualActivity !== undefined && this.actualActivity !== null) {
      if (this.actualActivity.visibility == "friends") {
        if ((+this.authenticationService.userId) == this.actualActivity.owner_id) {

        } else {
          if (!this.communicationService.friends.has(this.actualActivity.owner_id)) {
            this.router.navigate(["/"]);
          }
        }
      }
    }

    this.activityService.getCommentsOfActivity(this.actualActivity.id).subscribe(response => {
      this.comments$ = response;
      this.optionsClicked = [];
      for (let i = 0; i < this.comments$.length; i++) {
        this.optionsClicked.push(false);
      }
    });

    this.authenticationService.logedUser$.subscribe((logedUser) => {
      this.isLoged = logedUser;
      this.actualOptions$ = [];

      if (this.isLoged) {
        this.logedUserId = +this.authenticationService.userId;
        this.logedUserDetails = this.authenticationService.user$;

        if (this.actualActivity.owner_id == (+this.authenticationService.userId)) {
          this.actualOptions$.push(this.options[0]);
          this.actualOptions$.push(this.options[2]);
          if (this.goToActivity) {
            this.actualOptions$.push(this.options[3]);
          }
        } else {
          this.actualOptions$.push(this.options[2]);
          this.actualOptions$.push(this.options[1]);
          if (this.goToActivity) {
            this.actualOptions$.push(this.options[3]);
          }
        }
      } else {
        this.actualOptions$.push(this.options[2]);
        if (this.goToActivity) {
          this.actualOptions$.push(this.options[3]);
        }
      }
    });
  }

  bookDetail(book_id: number): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let link = "books/ " + book_id;
    this.router.navigate([link]);
  }

  userProfile(owner_id: number): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let link = "user/ " + owner_id;
    this.router.navigate([link]);
  }

  sendComment(): void {

    if (this.user_comment.trim() != "") {
      this.activityService.saveComment(this.authenticationService.userId, this.actualActivity.id, this.user_comment.trim()).subscribe(() => {

        this.communicationService.sendCommentToSocket(this.actualActivity.id);
        this.activityService.getCommentsOfActivity(this.actualActivity.id).subscribe(response => {
          this.comments$ = response;
          this.optionsClicked = [];
          for (let i = 0; i < this.comments$.length; i++) {
            this.optionsClicked.push(false);
          }

          this.user_comment = "";
        });
      });
    } else {
      this.user_comment = "";
    }
  }

  doOption(command: string): void {
    if (command == "delete") {
      this.activityService.deleteActivity(this.actualActivity.id).subscribe(() => {
        this.closerefreshDetails();
      })
    } else if (command == "report") {
      this.activityService.reportActivity(this.actualActivity.id).subscribe(() => {
      });
    } else if (command == "go_to_activity") {
      let link = "/activity/ " + this.actualActivity.id;
      this.router.navigate([link]);
    } else if (command == "copy_link") {
      let link = "http://localhost:4200/activity/ " + this.actualActivity.id;
      navigator.clipboard.writeText(link).then().catch(e => console.error(e));
    }
  }

  doCommentOption(command, id_comment) {
    if (command == "delete_comment") {
      this.activityService.deleteComment(id_comment).subscribe(() => {
        this.communicationService.deleteCommentToSocket(this.actualActivity.id);
        this.activityService.getCommentsOfActivity(this.actualActivity.id).subscribe(response => {
          this.comments$ = response;
          this.optionsClicked = [];
          for (let i = 0; i < this.comments$.length; i++) {
            this.optionsClicked.push(false);
          }
          this.user_comment = "";
        });
      });
    } else if (command == "report_comment") {
      this.activityService.reportComment(id_comment).subscribe(() => {
      });
    }
  }

  closerefreshDetails() {
    this.communicationService.socketOff("new_comment");
    this.communicationService.socketOff("new_comment_deleted");
    this.closerefreshActivityDetails.emit(null);
  }

  closeDetails() {
    this.communicationService.socketOff("new_comment");
    this.communicationService.socketOff("new_comment_deleted");
    this.closeActivityDetails.emit(null);
  }

}
