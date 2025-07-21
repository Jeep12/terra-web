import { TestBed } from '@angular/core/testing';

import { OfflineMarketService } from './offline-market.service';

describe('OfflineMarketService', () => {
  let service: OfflineMarketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfflineMarketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
