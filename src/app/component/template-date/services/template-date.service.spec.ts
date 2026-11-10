import { TestBed } from '@angular/core/testing';

import { TemplateDateService } from './template-date.service';

describe('TemplateDateService', () => {
  let service: TemplateDateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateDateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
