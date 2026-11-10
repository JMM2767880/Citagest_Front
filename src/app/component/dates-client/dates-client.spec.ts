import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatesClient } from './dates-client';

describe('DatesClient', () => {
  let component: DatesClient;
  let fixture: ComponentFixture<DatesClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatesClient],
    }).compileComponents();

    fixture = TestBed.createComponent(DatesClient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
