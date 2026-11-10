import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDate } from './template-date';

describe('TemplateDate', () => {
  let component: TemplateDate;
  let fixture: ComponentFixture<TemplateDate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateDate],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateDate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
