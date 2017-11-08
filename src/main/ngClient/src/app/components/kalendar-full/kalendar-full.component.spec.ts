import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KalendarFullComponent } from './kalendar-full.component';

describe('KalendarFullComponent', () => {
  let component: KalendarFullComponent;
  let fixture: ComponentFixture<KalendarFullComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KalendarFullComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KalendarFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
