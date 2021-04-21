import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderService } from './order.service';
import { AuthService } from '../auth/auth.service';
import { take, tap, switchMap } from 'rxjs/operators';
import { Animations } from '../shared/animations';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  animations: [Animations.flyIn]
})
export class OrderComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  orders: any = [];
  authSub: Subscription;
  isAuthenticated: boolean = false;
  userId: string;

  constructor(private orderService: OrderService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.authSub = this.authService.getAuthStatusListener().pipe(
      take(1),
      tap((isAuth) => {
        this.isAuthenticated = isAuth;
        this.userId = this.authService.getUser().userId;
      }),
      switchMap(() => {
        return this.orderService.getUserOrders(this.userId)
      })
    )
    .subscribe(
      (resData) => {
        this.orders = [...resData.orders];
        this.orders = this.orders.sort(this.compareDates);
        this.isLoading = false;
      },
      (errorMessage) => {
        this.isLoading = false;
        console.log(errorMessage);
      }
    )
  }

  compareDates(a: any, b: any) {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    const now = new Date().getTime();
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

  ngOnDestroy() {
    this.authSub.unsubscribe();
  }

}
