import { TestBed } from '@angular/core/testing';

import { AdServiceLoginService } from './ad-service-login.service';

describe('AdServiceLoginService', () => {
  let service: AdServiceLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdServiceLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
