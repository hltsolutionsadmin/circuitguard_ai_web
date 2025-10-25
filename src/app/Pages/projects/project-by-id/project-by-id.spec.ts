import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectById } from './project-by-id';

describe('ProjectById', () => {
  let component: ProjectById;
  let fixture: ComponentFixture<ProjectById>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectById]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectById);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
