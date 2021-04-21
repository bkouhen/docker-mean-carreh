import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAppointmentsComponent } from './admin-appointments.component';

describe('AdminAppointmentsComponent', () => {
  let component: AdminAppointmentsComponent;
  let fixture: ComponentFixture<AdminAppointmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAppointmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
