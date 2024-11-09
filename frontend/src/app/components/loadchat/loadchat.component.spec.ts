import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadchatComponent } from './loadchat.component';

describe('LoadchatComponent', () => {
  let component: LoadchatComponent;
  let fixture: ComponentFixture<LoadchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadchatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
