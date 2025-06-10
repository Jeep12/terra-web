import { TestBed } from '@angular/core/testing';

import { GameAccountService } from './game-account.service';

describe('GameAccountService', () => {
  let service: GameAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
