import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdPageSettingsComponent } from './ad-page-settings.component';

describe('AdPageSettingsComponent', () => {
  let component: AdPageSettingsComponent;
  let fixture: ComponentFixture<AdPageSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdPageSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdPageSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
