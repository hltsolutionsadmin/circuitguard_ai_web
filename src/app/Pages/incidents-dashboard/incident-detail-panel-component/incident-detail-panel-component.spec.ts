import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentDetailPanelComponent } from './incident-detail-panel-component';

describe('IncidentDetailPanelComponent', () => {
  let component: IncidentDetailPanelComponent;
  let fixture: ComponentFixture<IncidentDetailPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncidentDetailPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentDetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
