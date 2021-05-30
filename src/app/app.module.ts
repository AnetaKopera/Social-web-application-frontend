import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';

import { FormsModule } from '@angular/forms';

import { RegisterComponent } from './register/register.component';
import { NavigationComponent } from './navigation/navigation.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { LoginComponent } from './login/login.component';
import { BooksComponent } from './books/books.component';
import { ActivitiesComponent } from './activities/activities.component';
import { bookDetailComponent } from './book-detail/book-detail.component';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ActivityDetailsComponent } from './activity-details/activity-details.component';
import { ActivityComponent } from './activity/activity.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { FriendsComponent } from './friends/friends.component';

import { appInitializer } from '../app/app.initializer';
import { AuthenticationService } from './authentication.service';
import { CommunicationService } from './communication.service';
import { RegulationsComponent } from './regulations/regulations.component';
import { UserService } from './user.service';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    RegisterComponent,
    NavigationComponent,
    LoginComponent,
    BooksComponent,
    ActivitiesComponent,
    bookDetailComponent,
    CreateActivityComponent,
    UserProfileComponent,
    ActivityDetailsComponent,
    ActivityComponent,
    EditProfileComponent,
    FriendsComponent,
    RegulationsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [{ provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthenticationService, CommunicationService, UserService] },],
  bootstrap: [AppComponent]
})
export class AppModule { }
