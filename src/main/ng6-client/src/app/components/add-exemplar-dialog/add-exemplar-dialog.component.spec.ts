import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExemplarDialogComponent } from './add-exemplar-dialog.component';

describe('AddExemplarDialogComponent', () => {
  let component: AddExemplarDialogComponent;
  let fixture: ComponentFixture<AddExemplarDialogComponent>;

  beforeEach(async(() => {
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
