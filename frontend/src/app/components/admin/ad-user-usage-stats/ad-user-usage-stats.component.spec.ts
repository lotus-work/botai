import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdUserUsageStatsComponent } from './ad-user-usage-stats.component';

describe('AdUserUsageStatsComponent', () => {
  let component: AdUserUsageStatsComponent;
  let fixture: ComponentFixture<AdUserUsageStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdUserUsageStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdUserUsageStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
