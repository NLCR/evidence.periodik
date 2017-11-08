import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KalendarDayComponent } from './kalendar-day.component';

describe('KalendarDayComponent', () => {
  let component: KalendarDayComponent;
  let fixture: ComponentFixture<KalendarDayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KalendarDayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KalendarDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
