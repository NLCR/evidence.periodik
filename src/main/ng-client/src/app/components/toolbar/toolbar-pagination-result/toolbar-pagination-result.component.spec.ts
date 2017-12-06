import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarPaginationResultComponent } from './toolbar-pagination-result.component';

describe('ToolbarPaginationResultComponent', () => {
  let component: ToolbarPaginationResultComponent;
  let fixture: ComponentFixture<ToolbarPaginationResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolbarPaginationResultComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarPaginationResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
