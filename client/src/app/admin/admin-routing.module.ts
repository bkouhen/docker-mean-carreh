import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuard, AdminAuthGuard } from '../auth/auth.guard';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { ProductsCreateComponent } from './admin-products/products-create/products-create.component';
import { CanDeactivateGuard } from './admin-products/products-create/can-deactivate-guard';
import { UsersComponent } from './users/users.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminCategoriesComponent } from './admin-categories/admin-categories.component';
import { CategoryCreateComponent } from './admin-categories/category-create/category-create.component';
import { AdminBackgroundComponent } from './admin-background/admin-background.component';
import { AdminAppointmentsComponent } from './admin-appointments/admin-appointments.component';

const routes: Routes = [
  {path: '', component: AdminComponent, canActivate: [AuthGuard, AdminAuthGuard], children: [
    {path: 'products', component: AdminProductsComponent, children: [
      {path: 'create', component: ProductsCreateComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'edit/:id', component: ProductsCreateComponent, canDeactivate: [CanDeactivateGuard]}
    ]},
    {path: 'users', component: UsersComponent},
    {path: 'orders', component: AdminOrdersComponent},
    {path: 'categories', component: AdminCategoriesComponent, children: [
      {path: 'create', component: CategoryCreateComponent, canDeactivate: [CanDeactivateGuard]},
      {path: 'edit/:id', component: CategoryCreateComponent, canDeactivate: [CanDeactivateGuard]}
    ]},
    {path: 'background', component: AdminBackgroundComponent},
    {path: 'appointments', component: AdminAppointmentsComponent}
  ]}
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
