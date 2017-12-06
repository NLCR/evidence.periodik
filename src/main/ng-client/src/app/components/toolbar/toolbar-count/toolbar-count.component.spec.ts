import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarCountComponent } from './toolbar-count.component';

describe('ToolbarCountComponent', () => {
  let component: ToolbarCountComponent;
  let fixture: ComponentFixture<ToolbarCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
