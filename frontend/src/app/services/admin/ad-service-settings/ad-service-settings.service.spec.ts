import { TestBed } from '@angular/core/testing';

import { AdServiceSettingsService } from './ad-service-settings.service';

describe('AdServiceSettingsService', () => {
  let service: AdServiceSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdServiceSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
