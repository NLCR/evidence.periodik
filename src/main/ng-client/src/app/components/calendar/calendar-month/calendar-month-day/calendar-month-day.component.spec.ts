import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarMonthDayComponent } from './calendar-month-day.component';

describe('CalendarMonthDayComponent', () => {
  let component: CalendarMonthDayComponent;
  let fixture: ComponentFixture<CalendarMonthDayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarMonthDayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarMonthDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
