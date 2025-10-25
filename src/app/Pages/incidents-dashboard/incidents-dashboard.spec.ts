import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsDashboard } from './incidents-dashboard';

describe('IncidentsDashboard', () => {
  let component: IncidentsDashboard;
  let fixture: ComponentFixture<IncidentsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncidentsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
