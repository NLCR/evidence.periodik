import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarNavViewsComponent } from './toolbar-nav-views.component';

describe('ToolbarNavViewsComponent', () => {
  let component: ToolbarNavViewsComponent;
  let fixture: ComponentFixture<ToolbarNavViewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarNavViewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarNavViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
