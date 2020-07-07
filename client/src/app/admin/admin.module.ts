import { NgModule } from '@angular/core';
import { AdminComponent } from './admin.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { UsersComponent } from './users/users.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { AdminCategoriesComponent } from './admin-categories/admin-categories.component';
import { AdminBackgroundComponent } from './admin-background/admin-background.component';
import { AdminAppointmentsComponent } from './admin-appointments/admin-appointments.component';
import { AdminRoutingModule } from './admin-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ProductsCreateComponent, DialogDeactivate } from './admin-products/products-create/products-create.component';
import { CategoryCreateComponent } from './admin-categories/category-create/category-create.component';

@NgModule({
  declarations: [
    AdminComponent,
    AdminProductsComponent,
    ProductsCreateComponent,
    UsersComponent,
    AdminOrdersComponent,
    AdminCategoriesComponent,
    CategoryCreateComponent,
    AdminBackgroundComponent,
    AdminAppointmentsComponent,
    DialogDeactivate
  ],
  imports: [
    AdminRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AdminModule {}
