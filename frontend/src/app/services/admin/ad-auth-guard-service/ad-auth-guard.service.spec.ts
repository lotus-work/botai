import { TestBed } from '@angular/core/testing';

import { AdAuthGuardService } from './ad-auth-guard.service';

describe('AdAuthGuardService', () => {
  let service: AdAuthGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdAuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
