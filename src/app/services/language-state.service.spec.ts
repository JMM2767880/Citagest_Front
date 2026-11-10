import { TestBed } from '@angular/core/testing';

import { LanguageStateService } from './language-state.service';

describe('LanguageStateService', () => {
  let service: LanguageStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
