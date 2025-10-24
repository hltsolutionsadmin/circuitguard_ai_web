import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeamMember } from './add-team-member';

describe('AddTeamMember', () => {
  let component: AddTeamMember;
  let fixture: ComponentFixture<AddTeamMember>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTeamMember]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTeamMember);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
