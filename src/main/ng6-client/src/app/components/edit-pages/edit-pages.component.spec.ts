import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPagesComponent } from './edit-pages.component';

describe('EditPagesComponent', () => {
  let component: EditPagesComponent;
  let fixture: ComponentFixture<EditPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
