import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarPaginationCalendarComponent } from './toolbar-pagination-calendar.component';

describe('ToolbarPaginationCalendarComponent', () => {
  let component: ToolbarPaginationCalendarComponent;
  let fixture: ComponentFixture<ToolbarPaginationCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarPaginationCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarPaginationCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
