import { TestBed } from '@angular/core/testing';

import { OasisService } from './oasis.service';

describe('OasisService', () => {
  let service: OasisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OasisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
