import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailsForm } from './project-details-form';

describe('ProjectDetailsForm', () => {
  let component: ProjectDetailsForm;
  let fixture: ComponentFixture<ProjectDetailsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectDetailsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
