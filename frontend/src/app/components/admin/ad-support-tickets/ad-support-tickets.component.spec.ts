import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdSupportTicketsComponent } from './ad-support-tickets.component';

describe('AdSupportTicketsComponent', () => {
  let component: AdSupportTicketsComponent;
  let fixture: ComponentFixture<AdSupportTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdSupportTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdSupportTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
