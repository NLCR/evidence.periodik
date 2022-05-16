import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MetatitulComponent } from './metatitul.component';

describe('MetatitulComponent', () => {
  let component: MetatitulComponent;
  let fixture: ComponentFixture<MetatitulComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MetatitulComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetatitulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
