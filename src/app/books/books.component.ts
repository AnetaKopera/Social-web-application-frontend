import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from "rxjs";
import { BookService } from '../book.service';

import { Book } from "src/app/models/Book";
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {

  displayRanking: boolean = true;
  detailBook: Book;
  books$: Observable<Book[]>;
  searchForm: FormGroup;

  @ViewChild('formDirective') private formDirective: NgForm;
  
  constructor(
    private bookService: BookService,
    private router: Router) { }

  ngOnInit(): void {
    this.searchForm = this.createFormGroup();
    this.ranking();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      title: new FormControl("", [Validators.required, Validators.minLength(1)]),
    });
  }

  fetchRanking(): Observable<Book[]> {
    return this.bookService.fetchRanking();
  }

  ranking(): void {
    this.books$ = this.fetchRanking();
    this.displayRanking = true;
    this.searchForm.reset();    
    if(this.formDirective !== undefined){
      this.formDirective.resetForm();
    }
  }

  search(): void {
    this.books$ = this.findByTitle();
    this.displayRanking = false;
  }

  findByTitle(): Observable<Book[]> {
    return this.bookService.findByTitle(this.searchForm.value.title);
  }

  details(book: Book): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let link = "books/ " + book.id;
    this.router.navigate([link]);
  }

  closeDetails(): void {
    this.detailBook = null;
  }
}
