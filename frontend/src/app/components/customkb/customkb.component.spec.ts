import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomkbComponent } from './customkb.component';

describe('CustomkbComponent', () => {
  let component: CustomkbComponent;
  let fixture: ComponentFixture<CustomkbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomkbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomkbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
