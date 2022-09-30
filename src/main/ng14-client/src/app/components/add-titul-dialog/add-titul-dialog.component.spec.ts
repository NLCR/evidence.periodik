import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddTitulDialogComponent } from './add-titul-dialog.component';

describe('AddTitulDialogComponent', () => {
  let component: AddTitulDialogComponent;
  let fixture: ComponentFixture<AddTitulDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTitulDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTitulDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
