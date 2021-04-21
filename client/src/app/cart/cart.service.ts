import { Injectable } from '@angular/core';
import { Product } from '../products/products.component';
import { Subject, BehaviorSubject } from 'rxjs';

export interface Item {
  item: Product;
  Qty: number;
}

export interface Cart {
  items: Item[];
  totalQty: number;
}

@Injectable({providedIn: 'root'})
export class CartService {
  cart: Cart = {
    items: [],
    totalQty: 0
  }
  cartUpdated = new BehaviorSubject<Cart>(null);

  constructor() {}

  initCart() {
    localStorage.setItem('userCart', JSON.stringify(this.cart));
  }

  initCartFromStorage() {
    this.cart = JSON.parse(localStorage.getItem('userCart'));
  }

  checkCart() {
    const userCart : { items: Item[], totalQty: number} = JSON.parse(localStorage.getItem('userCart'));
    if (!userCart) {
      this.resetCart();
      this.initCart();
    } else {
      this.initCartFromStorage();
    }
  }

  addToCart(product: Product) {
    const productId = product.id;
    let Qty = 1;
    const foundProduct = this.cart.items.filter(item => item.item.id.indexOf(productId) === 0);
    if (foundProduct.length === 0) {
      this.cart.items.push({item: product, Qty: Qty})
    } else if (foundProduct.length === 1) {
      const index = this.cart.items.indexOf(foundProduct[0]);
      this.cart.items[index].Qty += 1;
    }
    this.cart.totalQty += 1;
    this.cartUpdated.next({...this.cart});
    this.setCart()
  }

  removeFromCart(productId: string) {
    const foundProduct = this.cart.items.filter(item => item.item.id.indexOf(productId) === 0);
    console.log(foundProduct);
    if (foundProduct.length === 0) {
      return;
    }
    const index = this.cart.items.indexOf(foundProduct[0]);
    if (this.cart.items[index].Qty === 1) {
      this.cart.items.splice(index, 1);
    } else if (this.cart.items[index].Qty > 1) {
      this.cart.items[index].Qty -= 1;
    }
    this.cart.totalQty -= 1;
    this.cartUpdated.next({...this.cart});
    this.setCart()
  }

  getCart() {
    this.checkCart();
    this.cartUpdated.next({...this.cart});
  }

  setCart() {
    localStorage.setItem('userCart', JSON.stringify(this.cart));
  }

  updateItemQuantity(itemIndex: number, quantity: number) {
    this.cart.items[itemIndex].Qty = quantity;
    this.calculateQuantity();
    this.cartUpdated.next({...this.cart});
    this.setCart();
  }

  removeItemFromCart(itemIndex: number) {
    this.cart.items.splice(itemIndex, 1);
    this.calculateQuantity();
    this.cartUpdated.next({...this.cart});
    this.setCart();
  }

  calculateQuantity() {
    let totalQty = 0;
    for (let item of this.cart.items) {
      totalQty += item.Qty;
    }
    this.cart.totalQty = totalQty;
  }

  resetCart() {
    this.cart.items = [];
    this.cart.totalQty = 0;
    localStorage.removeItem('userCart');
    this.cartUpdated.next({...this.cart});
  }

}
