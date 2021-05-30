import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms"
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  unsuccesfullLoged: boolean = null;

  @ViewChild('firstElement') firstInput: ElementRef;

  constructor(
    private authenticationService: AuthenticationService,
    private communicationService: CommunicationService,
    private router: Router) {
    if (this.authenticationService.logedUser$.getValue()) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.navigate(["/"]);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.createFormGroup();
    setTimeout(() => { this.firstInput.nativeElement.focus(); }, 0);
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(1)]),
    });
  }

  login(): void {
    this.authenticationService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(
      response => {
        this.communicationService.setUpAndGetData();
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(["/"]);

      },
      error => {
        this.unsuccesfullLoged = true;
      }
    );
  }

}
