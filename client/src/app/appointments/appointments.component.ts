import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { Time } from '@angular/common';
import { AppointmentsService } from './appointments.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PhoneNumberValidator } from '../cart/phone-number.validator';
import { DialogSubscribe } from '../cart/cart.component';
import { Animations } from '../shared/animations';

export interface Appointment {
  date: Date;
  time: Time;
  service: string;
  userId?: string;
  readStatus?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss'],
  animations: [Animations.flyIn],
  encapsulation: ViewEncapsulation.None
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  initLoading: boolean = false;
  newAppointment: boolean = false;
  displayCard: boolean = false;
  isAuthenticated: boolean = false;
  anonymousMode: boolean = false;
  infoForm: FormGroup;
  displayInfo: boolean = false;
  authSub: Subscription;
  userId: string;
  userEmail: string;
  minDate: Date;
  maxDate: Date;
  datePicked: boolean = false;
  allHours: Time[] = [];
  filteredHours: Time[] = [];
  appointmentTime: Time;
  appointmentDate: Date;
  serviceSelected: string;
  services = ['Coiffure', 'Esthétique', 'Spa'];
  // A récupérer de la BDD
  takenAppointments: Appointment[] = []
  // A récupérer de la BDD
  fullDates: Date[] = [new Date(2020, 5, 27)];
  myAppointments: Appointment[] = [];

  constructor(private appointmentsService: AppointmentsService, private dialog: MatDialog, private authService: AuthService, private router: Router) {
    const currentYear = new Date().getUTCFullYear();
    this.minDate = new Date(new Date());
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.minDate.setUTCHours(0,0,0,0);
    this.maxDate = new Date(currentYear, 11, 31);
    for (var i=9; i < 12; i++) {
      for (var j=0; j< 60; j+= 15) {
        this.allHours.push({hours: i, minutes: 0 + j})
      }
    }
  }

  ngOnInit(): void {
    this.initLoading = true;
    this.authSub = this.authService.getAuthStatusListener().pipe(
      take(1),
      tap((isAuth) => {
        this.isAuthenticated = isAuth;
        if (!isAuth) {
          return;
        }
        this.userId = this.authService.getUser().userId;
        this.userEmail = this.authService.getUser().userEmail;
      }),
      switchMap(() => {
        return this.appointmentsService.getTakenAppointments();
      }),
      take(1),
      tap(takenAppointments => {
        this.takenAppointments = [...takenAppointments.appointments];
      }),
      switchMap(() => {
        if (!this.isAuthenticated) {
          return of(null);
        }
        return this.appointmentsService.getUserAppointments(this.userId)
      })
    )
    .subscribe(
      (resData) => {
        if (!this.isAuthenticated) {
          return;
        }
        console.log('Taken', this.takenAppointments);
        const sortedAppointments = resData.appointments.slice().sort(this.compareDates);
        this.myAppointments = [...sortedAppointments].filter(appointment => {
          const now = new Date(new Date().setUTCHours(0,0,0,0)).getTime();
          const app = new Date(appointment.date).getTime();
          const diff = app - now;
          return diff >= 0;
        })
        this.initLoading = false;
      },
      (errorMessage) => {
        this.initLoading = false;
        console.log(errorMessage);
      }
    )
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

  dateFilter = (d: Date | null) : boolean => {
    const day = (d || new Date()).getUTCDay();
    //Filter out Sundays and dates that are full
    return day !== 6 && !this.fullDates.find(date => date.getTime() === d.getTime());
  }

  dateClass = (d: Date |null): MatCalendarCellCssClasses => {
    const day = d.getUTCDay();
    const month = d.getUTCMonth();
    const year = d.getUTCFullYear();
    return (day === 23 && month === 5 && year === 2020) ? 'custom-date-class' : '';
  }

  onChangeDate(dateLocal: Date) {
    const dateLocalString = dateLocal.toDateString();
    const dateUTCString = dateLocalString + ' UTC';
    const dateUTC = new Date(dateUTCString);
    const timeNow = new Date().toLocaleTimeString();
    const timeNowHM = {
      timeNowH: timeNow.split(':')[0],
      timeNowM: timeNow.split(':')[1]
    }
    this.appointmentTime = null;
    this.appointmentDate = null;
    this.serviceSelected = null;
    this.appointmentDate = dateUTC;
    this.filteredHours = this.allHours.filter(time => {
      const found = this.takenAppointments.find(appointment => {
        const appDate = new Date(appointment.date);
        return (
          dateUTC.getTime() === appDate.getTime()
        && time.hours === appointment.time.hours
        && time.minutes === appointment.time.minutes
        )
      });
      return !found && this.compareTime(dateUTC, timeNowHM, time);
    });
    if (!this.datePicked) {
      this.datePicked = true;
    }
  }

  compareTime(dateUTC: Date, timeNowHM: any, apptTime: any) {
    if (!dateUTC || !timeNowHM || !apptTime) {
      return false;
    }
    const now = new Date(new Date().setUTCHours(0,0,0,0)).getTime();
    if (dateUTC.getTime() !== now) {
      return true;
    }
    const nowHours = timeNowHM.timeNowH;
    const nowMinutes = timeNowHM.timeNowM;
    const apptHours = apptTime.hours;
    const apptMinutes = apptTime.minutes;
    if (nowHours > apptHours) {
      return false;
    } else if (nowHours < apptHours) {
      return true;
    } else {
      return nowMinutes < apptMinutes
    }
  }

  onHourChange(event) {

  }

  onServiceChange(event) {

  }

  onSubmitAppointment() {
    if (this.isAuthenticated) {
      this.isLoading = true;
      this.authService.checkProfileComplete(this.userId).subscribe(
        (resData) => {
          if (resData.profileComplete) {
            const dateUTC = this.appointmentDate;
            console.log(dateUTC);
            const appointmentData: Appointment = {
              date: dateUTC,
              time: this.appointmentTime,
              service: this.serviceSelected,
              userId: this.userId,
              email: this.userEmail
            }
            this.createAppointment(appointmentData, false);
          } else {
            this.isLoading = false;
            this.router.navigate(['/profile'], {queryParams: {complete: false}});
          }
        }
      )
    } else {
      this.openDialogSubscribe().afterClosed().subscribe((response) => {
        if (response === 'subscribe') {
          this.router.navigate(['/auth']);
        } else if (response === 'anonymous') {
          this.initInfoForm();
          this.anonymousMode = true;
          this.displayInfo = true;
        }
      })
    }

  }

  initInfoForm() {
    this.infoForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      phoneNumber: new FormControl(null, [Validators.required, Validators.maxLength(14)], PhoneNumberValidator)
    })
  }

  createAppointment(appointmentData: Appointment, anon: boolean) {
    console.log(appointmentData);
    this.appointmentsService.createAppointment(appointmentData).subscribe(
      (resData) => {
        console.log(resData);
        this.isLoading = false;
        if (anon) {
          this.openDialog()
          this.router.navigate(['/']);
          return;
        }
        this.myAppointments.push(resData.appointment);
        this.myAppointments = this.myAppointments.sort(this.compareDates);
        this.appointmentTime = null;
        this.appointmentDate = null;
        this.serviceSelected = null;
        this.appointmentDate = null;
        this.newAppointment = false;
        this.openDialog();
      },
      (errorMessage) => {
        console.log(errorMessage)
        this.isLoading = false;
      }
    );
  }

  onConfirmAnonAppointment() {
    if (this.infoForm.invalid) {
      return;
    }

    this.isLoading = true;
    const dateUTC = this.appointmentDate;
    console.log(dateUTC);
    const appointmentData: Appointment = {
      date: dateUTC,
      time: this.appointmentTime,
      service: this.serviceSelected,
      email: this.infoForm.value.email,
      firstName: this.infoForm.value.firstName,
      lastName: this.infoForm.value.lastName,
      phoneNumber: this.infoForm.value.phoneNumber.split(/\s/).join(''),
    }

    this.createAppointment(appointmentData, true);
  }

  openDialog() : MatDialogRef<DialogConfirmAppointment> {
    return this.dialog.open(DialogConfirmAppointment, {
      width: '400px'
    });
  }

  openDialogSubscribe() : MatDialogRef<DialogSubscribe> {
    return this.dialog.open(DialogSubscribe, {
      width: '250px'
    });
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

}

@Component({
selector: 'dialog-confirm-appointment',
templateUrl: 'dialog-confirm-appointment.html',
})
export class DialogConfirmAppointment {
constructor(public dialogRef: MatDialogRef<DialogConfirmAppointment>) {}

}
