import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdUserCustomKbComponent } from './ad-user-custom-kb.component';

describe('AdUserCustomKbComponent', () => {
  let component: AdUserCustomKbComponent;
  let fixture: ComponentFixture<AdUserCustomKbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdUserCustomKbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdUserCustomKbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
