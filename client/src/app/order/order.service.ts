import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Item } from '../cart/cart.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

const BACKEND_URL = environment.apiUrl + '/orders';

export interface Order {
  email: string,
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phoneNumber: string;
  date: any;
  price: number;
  items: Item[];
}

export interface OrderAuth {
  email: string;
  date: any;
  price: number;
  items: Item[];
  userId: string;
}

@Injectable({providedIn: 'root'})
export class OrderService {
  private orders: any;
  ordersUpdated = new Subject<any>();

  constructor(private http: HttpClient, private router: Router) {}

  createOrder(orderData: Order | OrderAuth) {
    return this.http.post<{message: string, order: any}>(BACKEND_URL + '/create', orderData);
  }

  getOrders() {
    this.http.get<{message: string, orders: any}>(BACKEND_URL).subscribe(
      (resData) => {
        this.orders = resData.orders;
        this.ordersUpdated.next(this.orders.slice());
      },
      (error) => {
        console.log(error);
        this.router.navigate(['/']);
      }
    );
  }

  getUserOrders(id: string) {
    return this.http.get<{message: string, orders: any}>(BACKEND_URL + '/users/' + id);
  }

  updateOrderReadStatus(id: string) {
    return this.http.put<{message: string}>(BACKEND_URL + '/updateReadStatus/' + id, {});
  }
}
