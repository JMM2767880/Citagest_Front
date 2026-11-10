import { TestBed } from '@angular/core/testing';

import { TvTurnService } from './tv-turn.service';

describe('TvTurnService', () => {
  let service: TvTurnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TvTurnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
