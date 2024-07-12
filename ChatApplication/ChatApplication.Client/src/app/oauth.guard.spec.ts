import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { oauthGuard } from './oauth.guard';

describe('oauthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => oauthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
