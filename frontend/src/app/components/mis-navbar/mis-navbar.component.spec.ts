import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisNavbarComponent } from './mis-navbar.component';

describe('MisNavbarComponent', () => {
  let component: MisNavbarComponent;
  let fixture: ComponentFixture<MisNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
