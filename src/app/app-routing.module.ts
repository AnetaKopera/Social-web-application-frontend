import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivitiesComponent } from './activities/activities.component';
import { ActivityComponent } from './activity/activity.component';
import { bookDetailComponent } from './book-detail/book-detail.component';
import { BooksComponent } from './books/books.component';
import { ChatComponent } from './chat/chat.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RegulationsComponent } from './regulations/regulations.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
  { path: "books", component: BooksComponent },
  { path: "books/:id", component: bookDetailComponent },
  { path: "user/:id", component: UserProfileComponent },
  { path: "activity/:id", component: ActivityComponent },
  { path: "register", component: RegisterComponent },
  { path: "login", component: LoginComponent },
  { path: "activities", component: ActivitiesComponent },
  { path: "chat", component: ChatComponent },
  { path: "regulations", component: RegulationsComponent },
  { path: "**", redirectTo: "activities" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
