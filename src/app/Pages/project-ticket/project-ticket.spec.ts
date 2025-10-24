import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTicket } from './project-ticket';

describe('ProjectTicket', () => {
  let component: ProjectTicket;
  let fixture: ComponentFixture<ProjectTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectTicket]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectTicket);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
