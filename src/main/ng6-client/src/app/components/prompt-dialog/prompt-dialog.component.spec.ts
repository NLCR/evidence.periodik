import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PromptDialogComponent } from './prompt-dialog.component';

describe('PromptDialogComponent', () => {
  let component: PromptDialogComponent;
  let fixture: ComponentFixture<PromptDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PromptDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
