import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

const BACKEND_URL = environment.apiUrl + '/notifications';

@Injectable({providedIn: 'root'})
export class NotificationService {

  notificationsUpdated = new BehaviorSubject<{notificationsCount: number, userCount: number, orderCount: number, appointmentCount: number}>({notificationsCount: 0, userCount: 0, orderCount: 0, appointmentCount: 0});
  constructor(private http: HttpClient) {}

  getNotifications() {
    this.http.get<{message: string, notificationsCount: number, userCount: number, orderCount: number, appointmentCount: number }>(BACKEND_URL).subscribe(
      (resData) => {
        console.log(resData);
        const globalCount = {
          notificationsCount: resData.notificationsCount,
          userCount: resData.userCount,
          orderCount: resData.orderCount,
          appointmentCount: resData.appointmentCount
        }
        this.notificationsUpdated.next(globalCount);
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );
  }
}
