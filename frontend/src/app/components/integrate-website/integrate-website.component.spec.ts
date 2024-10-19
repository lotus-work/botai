import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrateWebsiteComponent } from './integrate-website.component';

describe('IntegrateWebsiteComponent', () => {
  let component: IntegrateWebsiteComponent;
  let fixture: ComponentFixture<IntegrateWebsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IntegrateWebsiteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntegrateWebsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
