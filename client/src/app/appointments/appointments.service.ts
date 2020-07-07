import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Appointment } from './appointments.component';
import { HttpClient } from '@angular/common/http';

const BACKEND_URL = environment.apiUrl + '/appointments';

@Injectable({providedIn: 'root'})
export class AppointmentsService {

  constructor(private http: HttpClient) {}

  createAppointment(appointmentData: Appointment) {
    return this.http.post<{message: string, appointment: Appointment}>(BACKEND_URL + '/create', appointmentData);
  }

  getAppointments() {
    return this.http.get<{message: string, appointments: Appointment[]}>(BACKEND_URL);
  }

  getTakenAppointments() {
    return this.http.get<{message: string, appointments: Appointment[]}>(BACKEND_URL + '/taken');
  }

  getUserAppointments(id: string) {
    return this.http.get<{message: string, appointments: Appointment[]}>(BACKEND_URL + '/users/' + id);
  }

  updateAppointmentReadStatus(id: string) {
    return this.http.put<{message: string}>(BACKEND_URL + '/updateReadStatus/' + id, {});
  }
}
