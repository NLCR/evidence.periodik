import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddExemplarDialogComponent } from './add-exemplar-dialog.component';

describe('AddExemplarDialogComponent', () => {
  let component: AddExemplarDialogComponent;
  let fixture: ComponentFixture<AddExemplarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddExemplarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddExemplarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
