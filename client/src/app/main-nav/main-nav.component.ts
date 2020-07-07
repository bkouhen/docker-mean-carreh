import { Component, OnInit, OnDestroy } from '@angular/core';
import { MainNavService } from './main-nav.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';
import { Category, CategoriesService } from '../admin/admin-categories/categories.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit,  OnDestroy {

  constructor(private mainNavService: MainNavService, private authService: AuthService, private cartService: CartService, private categoriesService: CategoriesService, private notificationService: NotificationService) { }

  authSub: Subscription;
  isAuthenticated: boolean = false;
  userEmail: string;
  isAdmin: boolean = false;
  cartTotalQty: number = 0;
  cartSub: Subscription;
  adminSub: Subscription;
  categoriesSub: Subscription;
  categories: Category[] = [];
  notificationsCount: number = 0;
  notificationsSub: Subscription;
  toolbarHeightDecreased: boolean = false;

  ngOnInit(): void {
    //window.addEventListener('scroll', this.scrollEvent.bind(this), true);
    this.authSub = this.authService.getAuthStatusListener().subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        this.userEmail = this.authService.getUser().userEmail;
      }
    );
    this.cartSub = this.cartService.cartUpdated.subscribe(
      (cart) => {
        const total = cart.totalQty;
        this.cartTotalQty = total;
      }
    );
    this.adminSub = this.authService.adminListener.subscribe(
      (isAdmin) => {
        this.isAdmin = isAdmin;
        if (isAdmin) {
          this.notificationService.getNotifications();
        }
      }
    );
    this.cartService.getCart();
    this.categoriesService.getCategories();
    this.categoriesSub = this.categoriesService.categoriesUpdated.subscribe(
      (categories) => {
        this.categories = categories;
      }, (errorMessage) => {
        console.log(errorMessage);
      }
    );

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

  toggleNav(drawer : any) {
    drawer.toggle();
  }

  toggleToolbar(event: boolean) {
    if (event) {
      this.toolbarHeightDecreased = true;
    } else {
      this.toolbarHeightDecreased = false;
    }
  }

  scrollEvent(event:any) {
    let scrollValue = event.srcElement.scrollTop;
    this.mainNavService.scrollValue.next(scrollValue);
    if (scrollValue > 0) {
      this.mainNavService.scrollMobileHeaderToggle.next(true);
    } else {
      this.mainNavService.scrollMobileHeaderToggle.next(false);
    }
    if (scrollValue > 112) {
      this.mainNavService.scrollHeaderToggle.next(true);
    } else {
      this.mainNavService.scrollHeaderToggle.next(false);
    }
  }

  ngOnDestroy() {
    this.authSub.unsubscribe();
    this.cartSub.unsubscribe();
    this.adminSub.unsubscribe();
    this.notificationsSub.unsubscribe();
    //window.removeEventListener('scroll', this.scrollEvent.bind(this), true);
  }

}
