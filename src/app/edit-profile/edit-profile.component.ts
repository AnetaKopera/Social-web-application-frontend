import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, NgModel, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { CommunicationService } from '../communication.service';
import { User } from '../models/User';
import { UserService } from '../user.service';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})

export class EditProfileComponent implements OnInit {

  error_personal_data: boolean = false;
  error_email: boolean = false;
  error_password: boolean = false;
  error_picture_edit: boolean = false;
  error_picture_delete: boolean = false;
  error_description: boolean = false;

  name;
  surname;
  email;
  password_old;
  password_new;
  description;
  picture;
  email_form: FormGroup;

  @Input('user') user: User;
  @Output() closeEditUserProfile: EventEmitter<any> = new EventEmitter();

  constructor(
    private authenticationService: AuthenticationService,
    private communicationService: CommunicationService,
    private userService: UserService,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.email_form = new FormGroup({ email: new FormControl("", [Validators.required, Validators.email]) });
  }

  closeComponent(): void {
    this.closeEditUserProfile.emit(null);
  }

  changePersonalData(): void {
    let new_name = this.name;
    let new_surname = this.surname;

    let change_name = false;
    let change_surname = false;

    if (new_name !== null && new_name !== undefined) {
      new_name = new_name.trim();
      if (new_name.length > 0) {
        change_name = true;
      }
    }

    if (new_surname !== null && new_surname !== undefined) {
      new_surname = new_surname.trim();
      if (new_surname.length > 0) {
        change_surname = true;
      }
    }


    if (change_name && change_surname) {
      this.userService.updateNameAndSurname(this.authenticationService.userId, new_name, new_surname).subscribe(() => {
        this.name = null;
        this.surname = null;
        this.user.name = new_name;
        this.user.surname = new_surname;
        this.communicationService.sendChangeProfileData(this.user);
        this._snackBar.open("Zmieniono dane osobiste!", "", {
          duration: 500,
        });
      }, err => {
        this._snackBar.open("Wystąpił błąd!", "", {
          duration: 500,
        });
      });
    } else if (change_name) {
      this.userService.updateName(this.authenticationService.userId, new_name).subscribe(() => {
        this.name = null;
        this.user.name = new_name;
        this._snackBar.open("Zmieniono dane osobiste!", "", {
          duration: 500,
        });
        this.communicationService.sendChangeProfileData(this.user);
      }, err => {
        this._snackBar.open("Wystąpił błąd!", "", {
          duration: 500,
        });
      });
    } else if (change_surname) {
      this.userService.updateSurname(this.authenticationService.userId, new_surname).subscribe(() => {
        this.surname = null;
        this.user.surname = new_surname;
        this.communicationService.sendChangeProfileData(this.user);
        this._snackBar.open("Zmieniono dane osobiste!", "", {
          duration: 500,
        });
      }, err => {
        this._snackBar.open("Wystąpił błąd!", "", {
          duration: 500,
        });
      });
    }
  }

  changeEmail(): void {

    if (this.email_form.valid) {
      this.userService.updateEmail(this.authenticationService.userId, this.email_form.value.email).subscribe(() => {
        let new_email = this.email_form.value.email;
        this.email_form.reset();
        this.user.email = new_email;
        this._snackBar.open("Zmieniono email!", "", {
          duration: 500,
        });

      }, err => {
        this._snackBar.open("Wystąpił błąd!", "", {
          duration: 500,
        });
      });
    } else {
      this._snackBar.open("Wystąpił błąd!", "", {
        duration: 500,
      });
    }

  }

  changePassword(): void {
    let old_password = this.password_old;
    let new_password = this.password_new;

    if ((old_password !== null && old_password !== undefined) && (new_password !== null && new_password !== undefined)) {
      old_password = old_password.trim();
      new_password = new_password.trim();

      if (old_password.length > 4 && new_password.length > 4) {
        this.userService.updatePassword(this.authenticationService.userId, old_password, new_password).subscribe(
          (res) => {
            this.password_old = null;
            this.password_new = null;
            this._snackBar.open("Zmieniono hasło!", "", {
              duration: 500,
            });
          }, err => {
            this._snackBar.open("Wystąpił błąd!", "", {
              duration: 500,
            });
          });
      } else {
        this._snackBar.open("Wystąpił błąd!", "", {
          duration: 500,
        });
      }
    }
  }

  selectImage(event): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.picture = file;
    }
  }

  deletePicture(): void {
    this.userService.deletePicture((+this.authenticationService.userId), this.user.photo_path, this.user.photo_name).subscribe(() => {
      this.user.photo_path = null;
      this.user.photo_name = null;
      this.authenticationService.user$.photo_name = null;
      this.authenticationService.user$.photo_path = null;
      this._snackBar.open("Usunięto zdjęcie!", "", {
        duration: 500,
      });
      this.communicationService.sendChangeProfileData(this.user);
    }, err => {
      this._snackBar.open("Wystąpił błąd!", "", {
        duration: 500,
      });
    });
  }

  changePicture() {
    const formData = new FormData();
    formData.append('file', this.picture);
    formData.append('user_id', this.authenticationService.userId.toString());
    formData.append('photo_path', this.user.photo_path);
    formData.append('photo_name', this.user.photo_name);

    this.userService.updatePicture(formData).subscribe((res) => {
      this.userService.getUserDetails(this.authenticationService.userId).subscribe((user) => {
        this.authenticationService.user$ = user;
        this.user.photo_path = user.photo_path;
        this.user.photo_name = user.photo_name;
        this._snackBar.open("Zmieniono zdjęcie!", "", {
          duration: 500,
        });
        this.communicationService.sendChangeProfileData(this.user);
      });
    }, (err) => {
      this._snackBar.open("Wystąpił błąd!", "", {
        duration: 500,
      });
    })
  }

  changeDescription() {
    let new_description = this.description;
    if (new_description !== null && new_description !== undefined) {

      new_description = new_description.trim();
      this.description = null;
      if (new_description.length != 0) {
        this.userService.updateDescription(this.authenticationService.userId, new_description).subscribe(() => {
          this.user.description = new_description;
          this._snackBar.open("Zmieniono opis!", "", {
            duration: 500,
          });
          this.communicationService.sendChangeProfileData(this.user);
        }, err => {
          this._snackBar.open("Wystąpił błąd!", "", {
            duration: 500,
          });
        });
      }
    }
  }

  deleteDescription() {
    if (this.user.description !== null && this.user.description !== undefined) {
      this.userService.deleteDescription(this.authenticationService.userId).subscribe(() => {
        this.user.description = null;
        this._snackBar.open("Usunięto opis!", "", {
          duration: 500,
        });
        this.communicationService.sendChangeProfileData(this.user);
      }, err => {
        this._snackBar.open("Wystąpił błąd!", "", {
          duration: 500,
        });
      });
    }

  }

}
