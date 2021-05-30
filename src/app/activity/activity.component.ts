import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityService } from '../activity.service';
import { Activity } from '../models/Activity';


@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  activityId: number;
  activity: Activity;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activityService: ActivityService) { }

  ngOnInit(): void {
    this.activityId = (+this.route.snapshot.paramMap.get('id'));
    this.activityService.getActivity(this.activityId).subscribe(response => {
      if (response != null) {
        this.activity = response;
      }
    });
  }

  closeDetails(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate(["/"]);
  }

}
