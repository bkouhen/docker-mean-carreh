import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService, Cart, Item } from './cart.service';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderService, Order, OrderAuth } from '../order/order.service';
import { PhoneNumberValidator } from './phone-number.validator';
import { Animations } from '../shared/animations';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  animations: [Animations.flyIn]
})
export class CartComponent implements OnInit, OnDestroy {
  isLoading = false;
  cartSub: Subscription;
  cart: Cart;
  isAuthenticated: boolean = false;
  authSub: Subscription;
  userId: string;
  userEmail: string;
  orderConfirmed: boolean = false;
  anonymousMode: boolean = false;
  infoForm: FormGroup;
  displayInfo: boolean = false;
  quantityNumbers = Array(50).fill(0).map((x,i) => i+1);

  constructor(private cartService: CartService, private authService: AuthService, private orderService: OrderService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
  this.isLoading = true;
  this.authSub = this.authService.getAuthStatusListener().subscribe(
    (isAuth) => {
      this.isAuthenticated = isAuth;
      this.userEmail = this.authService.getUser().userEmail;
      this.userId = this.authService.getUser().userId;
    }
  )
  this.cartSub = this.cartService.cartUpdated.subscribe(
    (cart) => {
      this.cart = cart;
      this.isLoading = false;
    }
  );
  this.cartService.getCart();
  }

  onQuantityChange(event, item) {
    const itemIndex = this.cart.items.indexOf(item);
    const quantity = event.value;
    this.cartService.updateItemQuantity(itemIndex, quantity)
  }

  onRemoveItemFromCart(item) {
    const itemIndex = this.cart.items.indexOf(item);
    this.cartService.removeItemFromCart(itemIndex);
  }

  onSubmitCommand() {

    if (this.isAuthenticated) {
      this.isLoading = true;
      this.authService.checkProfileComplete(this.userId).subscribe(
        (resData) => {
          if (resData.profileComplete) {

            const orderData: OrderAuth = {
              email: this.userEmail,
              date: Date.now(),
              price: this.calculateItemsTotalPrice(this.cart.items),
              items: this.cart.items,
              userId: this.userId
            }
            this.createOrder(orderData, false);

          } else {
            this.isLoading = false;
            this.router.navigate(['/profile'], {queryParams: {complete: false}});
          }
        }
      )
    } else {
      this.openDialog().afterClosed().subscribe((response) => {
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

  calculateItemsTotalPrice(items: Item[]) {
    let totalPrice = 0;
    for (let item of items) {
      totalPrice += item.Qty * item.item.price
    }
    return totalPrice;
  }

  onConfirmAnonCommand() {
    if (this.infoForm.invalid) {
      return;
    }

    this.isLoading = true;

    const orderData: Order = {
      email: this.infoForm.value.email,
      firstName: this.infoForm.value.firstName,
      lastName: this.infoForm.value.lastName,
      address: this.infoForm.value.address,
      city: this.infoForm.value.city,
      phoneNumber: this.infoForm.value.phoneNumber.split(/\s/).join(''),
      date: Date.now(),
      price: this.calculateItemsTotalPrice(this.cart.items),
      items: this.cart.items
    }

    this.createOrder(orderData, true);
  }

  createOrder(orderData: Order | OrderAuth, anon: boolean) {
    this.orderService.createOrder(orderData).subscribe(
      (resData) => {
        this.isLoading = false;
        this.cartService.resetCart();
        this.router.navigate(['/order-complete'], {queryParams: {result: 'success', anon: anon}});
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
        this.router.navigate(['/order-complete'], {queryParams: {result: 'fail', anon: anon}});
      }
    );
  }

  initInfoForm() {
    this.infoForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      firstName: new FormControl(null, Validators.required),
      lastName: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      phoneNumber: new FormControl(null, [Validators.required, Validators.maxLength(14)], PhoneNumberValidator)
    })
  }

  openDialog() : MatDialogRef<DialogSubscribe> {
    return this.dialog.open(DialogSubscribe, {
      width: '250px'
    });
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
  }

}

@Component({
  selector: 'dialog-subscribe',
  templateUrl: 'dialog-subscribe.html',
})
export class DialogSubscribe {
  constructor(public dialogRef: MatDialogRef<DialogSubscribe>) {}

  onClick(response: string) {
    this.dialogRef.close(response);
  }

}
