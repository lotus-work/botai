import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdAddUserComponent } from './ad-add-user.component';

describe('AdAddUserComponent', () => {
  let component: AdAddUserComponent;
  let fixture: ComponentFixture<AdAddUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdAddUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdAddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
