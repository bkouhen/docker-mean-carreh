import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetTokenComponent } from './password-reset-token.component';

describe('PasswordResetTokenComponent', () => {
  let component: PasswordResetTokenComponent;
  let fixture: ComponentFixture<PasswordResetTokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordResetTokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
