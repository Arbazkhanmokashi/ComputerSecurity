import { TestBed } from '@angular/core/testing';

import { UserKeySetupService } from './user-key-setup.service';

describe('UserKeySetupService', () => {
  let service: UserKeySetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserKeySetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
