import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivityService } from '../activity.service';
import { AuthenticationService } from '../authentication.service';
import { BookService } from '../book.service';
import { Book } from '../models/Book';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrls: ['./create-activity.component.scss']
})
export class CreateActivityComponent implements OnInit {

  books$: Observable<Book[]>;
  activityTypes$: Observable<[]>;
  grades$: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  visibilities$: string[][] = [["public", "Publiczne"], ["friends", "Znajomi"]];
  searchForm: FormGroup;
  selectedBook: Book = null;
  selectedTypeOfActivity = null;
  selectedVisibility: string = null;
  activity_text: string = null;
  selectedGrade = null;
  errors: boolean = false;
  chooseBookList: boolean = false;

  @Input('closeButton') closeButton: boolean;
  @Output() refresh: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor(
    private bookService: BookService,
    private activityService: ActivityService,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    this.searchForm = this.createFormGroup();
    this.activityTypes$ = this.getAllActivityTypes();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      title: new FormControl("", [Validators.required, Validators.minLength(1)]),
    });
  }

  search(): void {
    this.selectedBook = null;
    this.books$ = this.findByTitle();
    this.chooseBookList = true;
  }

  findByTitle(): Observable<Book[]> {
    return this.bookService.findByTitle(this.searchForm.value.title);
  }

  getAllActivityTypes(): Observable<[]> {
    return this.activityService.getAllActivityTypes();
  }

  checkIsErrorsExists(): boolean {

    let errorList = [];
    if (this.selectedBook == null) {
      errorList.push("Książka musi być wybrana!");
    }

    if (this.activity_text == null) {
      errorList.push("Pole opis jest wymagane by stworzyć aktywność!");
    } else if (this.activity_text.trim().length < 1) {
      errorList.push("Pole opis jest wymagane by stworzyć aktywność!");
    }

    if (this.selectedTypeOfActivity == null) {
      errorList.push("Musisz wybrać rodzaj aktywności");
    }
    if (this.selectedTypeOfActivity != null && this.selectedTypeOfActivity.label == "Oceniono") {
      if (this.selectedGrade == null) {
        errorList.push("Musisz wybrać ocenę dla książki");
      }
    } else {
      this.selectedGrade = null;
    }

    if (errorList.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  createPost(): void {
    this.errors = this.checkIsErrorsExists();
    if (!this.errors) {
      if (this.selectedGrade != null) {
        this.activityService.postActivityWithGrade(this.selectedBook.id, this.activity_text.trim(), this.selectedTypeOfActivity.id, this.selectedGrade, this.authenticationService.userId, this.selectedVisibility).subscribe(() => {
          this.refresh.emit(null);
        });
      } else {
        this.activityService.postActivity(this.selectedBook.id, this.activity_text.trim(), this.selectedTypeOfActivity.id, this.authenticationService.userId, this.selectedVisibility).subscribe(() => {
          this.refresh.emit(null);
        });
      }
    }
  }

  closeComponent(): void {
    this.close.emit(null);
  }

}
