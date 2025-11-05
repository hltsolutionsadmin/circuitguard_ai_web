import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResolvedComponent } from './resolved-component';

describe('ResolvedComponent', () => {
  let component: ResolvedComponent;
  let fixture: ComponentFixture<ResolvedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResolvedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolvedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
