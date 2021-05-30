import { ComponentFixture, TestBed } from '@angular/core/testing';

import { bookDetailComponent } from './book-detail.component';

describe('bookDetailComponent', () => {
  let component: bookDetailComponent;
  let fixture: ComponentFixture<bookDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ bookDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(bookDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
