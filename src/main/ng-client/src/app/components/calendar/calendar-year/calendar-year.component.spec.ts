import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarYearComponent } from './calendar-year.component';

describe('CalendarYearComponent', () => {
  let component: CalendarYearComponent;
  let fixture: ComponentFixture<CalendarYearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarYearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
