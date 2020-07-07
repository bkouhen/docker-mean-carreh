// Core imports
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Module imports
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';

// Main components imports
import { AppComponent } from './app.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { FooterComponent } from './footer/footer.component';

// Other components imports
import { OrderDoneComponent } from './order-done/order-done.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { PasswordResetTokenComponent } from './password-reset-token/password-reset-token.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    // Main components
    AppComponent,
    MainNavComponent,
    HomeComponent,
    ProductsComponent,
    CartComponent,
    OrderComponent,
    AppointmentsComponent,
    UserProfileComponent,
    FooterComponent,

    // Other Components
    OrderDoneComponent,
    PasswordResetComponent,
    PasswordResetTokenComponent,
    PageNotFoundComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    CoreModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
