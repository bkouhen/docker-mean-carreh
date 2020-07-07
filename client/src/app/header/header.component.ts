import { Component, OnInit, EventEmitter, Output, OnDestroy} from '@angular/core';
import { HeaderAnimation } from './header.animation';
import { MainNavService } from '../main-nav/main-nav.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Category, CategoriesService } from '../admin/admin-categories/categories.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [HeaderAnimation.fixedMobileHeader]
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Output() navOpen = new EventEmitter<any>();
  @Output() mobileHeaderToggle = new EventEmitter<boolean>();
  scrollSub: Subscription;
  headerState: string = 'normal';
  windowWidth: number;

  constructor(private mainNavService: MainNavService) {
    this.setWindowWidth();
  }

  ngOnInit(): void {
    window.addEventListener('resize', this.setWindowWidth.bind(this), true)
    window.addEventListener('orientationchange', this.setWindowWidth.bind(this), true)
    this.scrollSub = this.mainNavService.scrollMobileHeaderToggle.subscribe(
      (isScroll) => {
        if (isScroll && this.windowWidth <= 768) {
          this.headerState = 'fixed';
          this.mobileHeaderToggle.emit(true);
        } else {
          this.headerState = 'normal';
          this.mobileHeaderToggle.emit(false);
        }
      }
    );
  }

  setWindowWidth() {
    this.windowWidth = window.innerWidth;
  }

  onToggleNav() {
    this.navOpen.emit();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.setWindowWidth.bind(this), true)
    window.removeEventListener('orientationchange', this.setWindowWidth.bind(this), true)
  }

}

@Component({
  selector: 'app-bottom-header',
  templateUrl: './bottom-header.component.html',
  styleUrls: ['./bottom-header.component.scss'],
  animations: [HeaderAnimation.fixedHeader, HeaderAnimation.triggerChange]

})
export class BottomHeaderComponent implements OnInit, OnDestroy {
  headerState: string = 'normal';
  scrollSub: Subscription;
  authSub: Subscription;
  isAuthenticated: boolean = false;
  userEmail: string;
  isAdmin: boolean = false;
  adminSub: Subscription;
  cartSub: Subscription;
  cartTotalQty: number = 0;
  pulsing: boolean = false;
  urlSub: Subscription;
  actualUrl: string;
  productsUrl: boolean = false;
  categoriesSub: Subscription;
  categories: Category[] = [];
  notificationsSub: Subscription;
  notificationsCount: number = 0;

  constructor(private mainNavService: MainNavService, private authService: AuthService, private cartService: CartService, router: Router, private categoriesService: CategoriesService, private notificationService: NotificationService) {
    this. urlSub = router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe((event: NavigationEnd) => {
      this.actualUrl = event.url;
    })
  }

  ngOnInit() {
    if (this.actualUrl.startsWith('/products')) {
      this.productsUrl = true;
    }
    this.authSub = this.authService.getAuthStatusListener().subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        this.userEmail = this.authService.getUser().userEmail;
      }
    )
    this.scrollSub = this.mainNavService.scrollHeaderToggle.subscribe(
      (isScroll) => {
        if (isScroll) {
          this.headerState = 'fixed';
        } else {
          this.headerState = 'normal';
        }
      }
    );
    this.adminSub = this.authService.adminListener.subscribe(
      (isAdmin) => {
        this.isAdmin = isAdmin;
      }
    );
    this.cartSub = this.cartService.cartUpdated.subscribe(
      (cart) => {
        const total = cart.totalQty;
        this.cartTotalQty = total;
      }
    );
    this.cartService.getCart();
    this.categoriesSub = this.categoriesService.categoriesUpdated.subscribe(
      (categories) => {
        this.categories = categories;
      }, (errorMessage) => {
        console.log(errorMessage);
      }
    );
    //this.notificationService.getNotifications();
    this.notificationsSub = this.notificationService.notificationsUpdated.subscribe(
      (globalCount) => {
        this.notificationsCount = globalCount.notificationsCount;
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );

  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.scrollSub.unsubscribe();
    this.authSub.unsubscribe();
    this.adminSub.unsubscribe();
    this.cartSub.unsubscribe();
    this.urlSub.unsubscribe();
    this.categoriesSub.unsubscribe();
    this.notificationsSub.unsubscribe();
  }
}
