import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SvazekComponent } from './svazek.component';

describe('SvazekComponent', () => {
  let component: SvazekComponent;
  let fixture: ComponentFixture<SvazekComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvazekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvazekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
