import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddVdkExComponent } from './add-vdk-ex.component';

describe('AddVdkExComponent', () => {
  let component: AddVdkExComponent;
  let fixture: ComponentFixture<AddVdkExComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVdkExComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVdkExComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
