import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsEsComponent } from './terms-es.component';

describe('TermsEsComponent', () => {
  let component: TermsEsComponent;
  let fixture: ComponentFixture<TermsEsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsEsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsEsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
