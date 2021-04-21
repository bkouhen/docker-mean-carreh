import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../angular-material.module';

import { HeaderComponent, BottomHeaderComponent } from '../header/header.component';
import { IfChangesDirective } from './if-changes.directive';

// Dialog components imports
import { DialogResetPassword } from '../password-reset-token/password-reset-token.component';
import { DialogConfirmAppointment } from '../appointments/appointments.component';
import { DialogSubscribe } from '../cart/cart.component';
import { DialogEditChange } from '../user-profile/user-profile.component';
import { DialogContactSent, DialogContactFail } from '../home/home.component';
import { DialogResetEmailSent } from '../password-reset/password-reset.component';

@NgModule({
  declarations: [
    HeaderComponent,
    BottomHeaderComponent,
    IfChangesDirective,

  // Dialog Components
    // Cart
    DialogSubscribe,
    // User profile
    DialogEditChange,
    // Home
    DialogContactSent,
    DialogContactFail,
    // Reset
    DialogResetEmailSent,
    DialogResetPassword,
    // Appointments
    DialogConfirmAppointment
  ],
  imports: [
    CommonModule,
    AngularMaterialModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    BottomHeaderComponent,
    IfChangesDirective,
    DialogSubscribe,
    DialogEditChange,
    DialogContactSent,
    DialogContactFail,
    DialogResetEmailSent,
    DialogResetPassword,
    DialogConfirmAppointment,
    CommonModule,
    AngularMaterialModule
  ]
})
export class SharedModule {}
