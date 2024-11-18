import { TestBed } from '@angular/core/testing';

import { AdServiceUsersService } from './ad-service-users.service';

describe('AdServiceUsersService', () => {
  let service: AdServiceUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdServiceUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
