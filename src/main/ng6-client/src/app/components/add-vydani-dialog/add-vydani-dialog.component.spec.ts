import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVydaniDialogComponent } from './add-vydani-dialog.component';

describe('AddVydaniDialogComponent', () => {
  let component: AddVydaniDialogComponent;
  let fixture: ComponentFixture<AddVydaniDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVydaniDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVydaniDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
