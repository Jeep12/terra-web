import { TestBed } from '@angular/core/testing';

import { SpriteServiceService } from './sprite-service.service';

describe('SpriteServiceService', () => {
  let service: SpriteServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpriteServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
