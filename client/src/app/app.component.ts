import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { CartService } from './cart/cart.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private authService: AuthService, private cartService: CartService, private router: Router) {
    let vh: number = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  ngOnInit() {
    this.authService.autoLogin();
    this.cartService.getCart();
    window.addEventListener('resize', () => {
      let vh: number = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
    window.addEventListener('orientationchange', () => {
      let vh: number = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    });
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      const element = document.querySelector('#main-header');
        if (element) {
          element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }

  });
  }

  ngOnDestroy() {
  }
}
