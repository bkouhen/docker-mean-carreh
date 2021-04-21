import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { NotAuthGuard } from './auth.guard';

@NgModule({
  imports: [
    RouterModule.forChild([{path: '', component: AuthComponent, canActivate: [NotAuthGuard]}])
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule {}
