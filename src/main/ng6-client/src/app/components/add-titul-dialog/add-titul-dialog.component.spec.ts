import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTitulDialogComponent } from './add-titul-dialog.component';

describe('AddTitulDialogComponent', () => {
  let component: AddTitulDialogComponent;
  let fixture: ComponentFixture<AddTitulDialogComponent>;

  beforeEach(async(() => {
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
