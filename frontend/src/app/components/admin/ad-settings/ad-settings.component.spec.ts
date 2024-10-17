import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdSettingsComponent } from './ad-settings.component';

describe('AdSettingsComponent', () => {
  let component: AdSettingsComponent;
  let fixture: ComponentFixture<AdSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
