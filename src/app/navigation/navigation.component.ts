import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})

export class NavigationComponent implements OnInit {

  isLoged: boolean = true;
  unreadedMessages: number = 0;
  unreadedInvitations: number = 0;
  myProfileHref;

  constructor(
    private authenticationService: AuthenticationService,
    private communicationService: CommunicationService,
    private router: Router) { }

  ngOnInit(): void {
    this.authenticationService.logedUser$.subscribe((logedUser) => {
      this.isLoged = logedUser;
      this.unreadedMessages = this.communicationService.unreadedMessages;
      this.unreadedInvitations = this.communicationService.unreadedInvitations;
      this.myProfileHref = "user/ " + this.authenticationService.userId;
    });
  }

  ngDoCheck(): void {
    this.unreadedMessages = this.communicationService.unreadedMessages;
    this.unreadedInvitations = this.communicationService.unreadedInvitations;
  }

  logout(): void {
    this.authenticationService.logedUser$.next(false);
    this.authenticationService.stopCountdownToRefresh();
    this.communicationService.deleteSocketConnection();
    this.communicationService.userLogout();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate(["login"]);
  }

}
