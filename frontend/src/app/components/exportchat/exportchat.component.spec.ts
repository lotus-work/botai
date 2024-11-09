import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportchatComponent } from './exportchat.component';

describe('ExportchatComponent', () => {
  let component: ExportchatComponent;
  let fixture: ComponentFixture<ExportchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExportchatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
