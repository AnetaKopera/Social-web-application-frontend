import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  unsuccesfullRegister: boolean = null;
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
    this.registerForm = this.createFormGroup();
    setTimeout(() => { this.firstInput.nativeElement.focus(); }, 0);
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  lengthWithoutWhitespaces(control: FormControl) {
    const isGoodLength = (control.value || '').trim().length < 7;
    const isValid = !isGoodLength;
    return isValid ? null : { 'tooshort': true };
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl("", [Validators.required, this.noWhitespaceValidator, Validators.minLength(1), Validators.maxLength(64)]),
      surname: new FormControl("", [Validators.required, this.noWhitespaceValidator,  Validators.minLength(1), Validators.maxLength(64)]),
      description: new FormControl("", [Validators.maxLength(1000)]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        this.noWhitespaceValidator,
        this.lengthWithoutWhitespaces,
        Validators.required,
      ]),
      rules: new FormControl("", [Validators.requiredTrue]),
    });
  }

  signup(): void {
    this.authenticationService.signup(this.registerForm.value).subscribe((msg) => {
      this.communicationService.setUpAndGetData();
      this.router.navigate(["/"]);
    },
      error => {
        this.unsuccesfullRegister = true;
      });
  }

}
