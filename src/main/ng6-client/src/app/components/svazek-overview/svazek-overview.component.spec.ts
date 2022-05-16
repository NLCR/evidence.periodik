import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SvazekOverviewComponent } from './svazek-overview.component';

describe('SvazekOverviewComponent', () => {
  let component: SvazekOverviewComponent;
  let fixture: ComponentFixture<SvazekOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SvazekOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvazekOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
