import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetUsedComponent } from './facet-used.component';

describe('FacetUsedComponent', () => {
  let component: FacetUsedComponent;
  let fixture: ComponentFixture<FacetUsedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetUsedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetUsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
