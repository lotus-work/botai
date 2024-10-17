import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdNavbarComponent } from './ad-navbar.component';

describe('AdNavbarComponent', () => {
  let component: AdNavbarComponent;
  let fixture: ComponentFixture<AdNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
