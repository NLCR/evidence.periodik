import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarListItemComponent } from './calendar-list-item.component';

describe('CalendarListItemComponent', () => {
  let component: CalendarListItemComponent;
  let fixture: ComponentFixture<CalendarListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
