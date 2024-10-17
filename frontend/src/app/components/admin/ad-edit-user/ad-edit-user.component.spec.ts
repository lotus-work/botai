import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdEditUserComponent } from './ad-edit-user.component';

describe('AdEditUserComponent', () => {
  let component: AdEditUserComponent;
  let fixture: ComponentFixture<AdEditUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdEditUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdEditUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
