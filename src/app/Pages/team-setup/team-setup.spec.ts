import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamSetup } from './team-setup';

describe('TeamSetup', () => {
  let component: TeamSetup;
  let fixture: ComponentFixture<TeamSetup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamSetup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamSetup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
