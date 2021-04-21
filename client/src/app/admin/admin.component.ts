import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  activeLink: string = 'home';
  urlSub: Subscription;
  notificationsSub: Subscription;
  userCount: number = 0;
  orderCount: number = 0;
  appointmentCount: number = 0;

  constructor(private router: Router, private notificationService: NotificationService) {
    this. urlSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe((event: NavigationEnd) => {
      const link = event.url.split('/')[2];
      if (!link) {
        this.activeLink = 'home';
      } else {
        this.activeLink = link;
      }
    });
    //this.notificationService.getNotifications();
    this.notificationsSub = this.notificationService.notificationsUpdated.subscribe(
      (globalCount) => {
        this.userCount = globalCount.userCount;
        this.orderCount = globalCount.orderCount;
        this.appointmentCount = globalCount.appointmentCount
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.urlSub.unsubscribe();
    this.notificationsSub.unsubscribe();
  }

}
