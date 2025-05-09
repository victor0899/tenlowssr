import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertCookiesComponent } from './alert-cookies.component';

describe('AlertCookiesComponent', () => {
  let component: AlertCookiesComponent;
  let fixture: ComponentFixture<AlertCookiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertCookiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertCookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
