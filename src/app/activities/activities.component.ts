import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from '../models/Activity';
import { Router } from '@angular/router';
import { ActivityService } from '../activity.service'
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';
import { User } from '../models/User';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})

export class ActivitiesComponent implements OnInit {

  isLoged: boolean = false;
  logedUserDetails: User;
  logedUserId = null;
  activityDetailsInformation: boolean = false;
  actualActivity: Activity;
  activityForm: boolean = false;
  activities$: Activity[];
  @ViewChild('scroll') private myScrollContainer: ElementRef;

  constructor(
    private activityService: ActivityService,
    private authenticationService: AuthenticationService,
    private communicationService: CommunicationService,
    private router: Router) {}

  ngOnInit(): void {
    this.refresh();
  }

  createdPost(): void {
    this.activityForm = false;
    this.refresh();
  }

  refresh(): void {
    this.fetchPublicActivities().subscribe(res => {
      let tmpActivities: Activity[] = res;

      this.authenticationService.logedUser$.subscribe((logedUser) => {

        this.isLoged = logedUser;
        if (this.isLoged) {
          this.logedUserId = this.authenticationService.userId;
          this.logedUserDetails = this.authenticationService.user$;

          this.activityService.fetchFriendAtivities(this.authenticationService.userId).subscribe(
            activities => {
              for (let i = 0; i < activities.length; i++) {
                tmpActivities.push(activities[i]);
              }

              this.communicationService.friends.forEach((value: User, key: number) => {
                this.activityService.fetchFriendAtivities(value.id).subscribe(
                  activities => {
                    for (let i = 0; i < activities.length; i++) {
                      tmpActivities.push(activities[i]);

                    }
                    tmpActivities.sort((n1, n2) => {
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

                    this.activities$ = tmpActivities;
                    this.myScrollContainer.nativeElement.scrollTop = 0;
                  }
                );
              });
              if (this.communicationService.friends.size == 0) {

                tmpActivities.sort((n1, n2) => {
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

                this.activities$ = tmpActivities;
                this.myScrollContainer.nativeElement.scrollTop = 0;
              }
            }
          );
        } else {

          tmpActivities.sort((n1, n2) => {
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

          this.activities$ = tmpActivities;
          this.myScrollContainer.nativeElement.scrollTop = 0;

        }
      });
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

  fetchPublicActivities(): Observable<Activity[]> {
    return this.activityService.fetchPublicActivities();
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

  activityDetails(activity: Activity): void {
    this.actualActivity = activity;
    this.activityDetailsInformation = true;
  }

  closeDetails(): void {
    this.actualActivity = null;
    this.activityDetailsInformation = false;
  }

  createActivityForm(): void {
    this.activityForm = true;
  }

}
