import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderService } from 'src/app/order/order.service';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  orders: any = [];
  sortedOrders: any = [];
  ordersSub: Subscription;

  constructor(private orderService: OrderService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.orderService.getOrders();
    this.ordersSub = this.orderService.ordersUpdated.subscribe(
      (orders) => {
        this.orders = orders.slice().sort(this.compareDates);
        this.isLoading = false;
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
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

  updateOrderReadStatus(order: any, id: string) {
    if (order.readStatus === 0) {
      console.log(id);
      order.readStatus = 1;
      order.read = 1;
      this.orderService.updateOrderReadStatus(id).subscribe(
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
    this.ordersSub.unsubscribe();
  }

}
