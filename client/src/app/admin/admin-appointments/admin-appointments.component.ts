import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Appointment } from 'src/app/appointments/appointments.component';
import { AppointmentsService } from 'src/app/appointments/appointments.service';
import { NotificationService } from 'src/app/notification.service';
import { MatCalendarCellCssClasses, MatCalendar } from '@angular/material/datepicker';

@Component({
  selector: 'app-admin-appointments',
  templateUrl: './admin-appointments.component.html',
  styleUrls: ['./admin-appointments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdminAppointmentsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  appointments: any = [];
  filteredAppointments: any = [];
  appointmentsSub: Subscription;
  displayAppointments: boolean = true;
  minDate: Date;
  maxDate: Date;
  selectedDate: Date = new Date();

  constructor(private appointmentsService: AppointmentsService, private notificationService: NotificationService) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(new Date().setUTCHours(0,0,0,0));
    this.maxDate = new Date(currentYear, 11, 31);
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.appointmentsSub = this.appointmentsService.getAppointments().subscribe(
      (resData) => {
        console.log(resData);
        this.appointments = [...resData.appointments];
        this.filteredAppointments = [...resData.appointments].filter(appointment => {
          const now = new Date(new Date().setUTCHours(0,0,0,0)).getTime();
          const date = new Date(appointment.date);
          return date.getTime() === now;
        }).sort(this.compareTime);
        this.isLoading = false;
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    )
  }

  onChangeDate(dateLocal: Date) {
    const dateLocalString = dateLocal.toDateString();
    const dateUTCString = dateLocalString + ' UTC';
    const dateUTC = new Date(dateUTCString);
    this.filteredAppointments = [...this.appointments].filter(appointment => {
      return new Date(appointment.date).getTime() === dateUTC.getTime();
    }).sort(this.compareTime);
  }

  dateFilter = (d: Date | null) : boolean => {
    const day = (d || new Date()).getUTCDay();
    //Filter out Sundays and dates that are full
    return day !== 6;
  }

  dateClass() {
    return (dateLocal: Date): MatCalendarCellCssClasses => {
      const dateLocalString = dateLocal.toDateString();
      const dateUTCString = dateLocalString + ' UTC';
      const dateUTC = new Date(dateUTCString);
      const now = new Date(new Date().setUTCHours(0,0,0,0)).getTime();
      const found = this.appointments.find(appointment => dateUTC.getTime() === new Date(appointment.date).getTime() && dateUTC.getTime() >= now);
      return found ? 'custom-date-class' : '';
    };
  }

  compareDates(a: any, b: any) {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    const now = new Date(new Date().setUTCHours(0,0,0,0)).getTime();
    const diffA = now - dateA;
    const diffB = now - dateB;

    let comparison = 0;
    if (diffA > diffB) {
      comparison = 1;
    } else if (diffB > diffA) {
      comparison = -1;
    }
    return comparison;
  }

  compareTime(a: any, b: any) {
    const hoursA = a.time.hours;
    const hoursB = b.time.hours;
    const minutesA = a.time.minutes;
    const minutesB = b.time.minutes;

    let comparison = 0;
    if (hoursA > hoursB) {
      comparison = 1;
    } else if (hoursB > hoursA) {
      comparison = -1;
    } else {
      minutesA > minutesB ? comparison = 1 : comparison = -1;
    }
    return comparison;
  }

  updateAppointmentReadStatus(appointment: any, id: string) {
    if (appointment.readStatus === 0) {
      appointment.readStatus = 1;
      appointment.read = 1;
      this.appointmentsService.updateAppointmentReadStatus(id).subscribe(
        (resData) => {
          console.log(resData);
          this.notificationService.getNotifications();
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    }
  }

  ngOnDestroy() {
    this.appointmentsSub.unsubscribe();
  }

}
