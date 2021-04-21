import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { CanDeactivateGuard } from './admin/admin-products/products-create/can-deactivate-guard';
import { AuthGuard, NotAuthGuard } from './auth/auth.guard';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { OrderDoneComponent } from './order-done/order-done.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PasswordResetTokenComponent } from './password-reset-token/password-reset-token.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppointmentsComponent } from './appointments/appointments.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(module => module.AuthModule)},
  {path: 'admin', loadChildren: () => import('./admin/admin.module').then(module => module.AdminModule)},
  {path: 'password-reset', component: PasswordResetComponent, canActivate: [NotAuthGuard]},
  {path: 'password-reset/:token', component: PasswordResetTokenComponent, canActivate: [NotAuthGuard]},
  {path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard]},
  {path: 'products', component: ProductsComponent},
  {path: 'cart', component: CartComponent},
  {path: 'orders', component: OrderComponent, canActivate: [AuthGuard]},
  {path: 'appointments', component: AppointmentsComponent},
  {path: 'order-complete', component: OrderDoneComponent},
  {path: '404', component: PageNotFoundComponent},
  {path: '**', redirectTo: '404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
