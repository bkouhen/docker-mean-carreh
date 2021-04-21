import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PasswordValidator } from './auth.password-validator';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Animations } from '../shared/animations';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  animations: [Animations.flyIn]
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  isLogin: boolean = true;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.authForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5)]),
      confirmPassword: new FormControl(null),
    });
    if (!this.isLogin) {
      this.authForm.setAsyncValidators(PasswordValidator);
      this.authForm.updateValueAndValidity();
      this.authForm.get('confirmPassword').setValidators([Validators.required, Validators.minLength(5)]);
      this.authForm.get('confirmPassword').updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.authForm.invalid) {
      return;
    }

    this.isLoading = true;

    let authObs: Observable<any>;

    const userData = {
      email: this.authForm.value.email,
      password: this.authForm.value.password,
      confirmPassword: this.authForm.value.confirmPassword
    };

    if (this.isLogin) {
      authObs = this.authService.login(userData);
    } else {
      authObs = this.authService.signup(userData);
    }

    authObs.subscribe(
      (resData) => {
        this.isLoading = false;
        if (this.isLogin) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/profile'], {queryParams: {complete: false}});
        }
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    );
  }

  switchAuthMode(loginMode: boolean) {
    if (loginMode) {
      this.isLogin = false;
      this.authForm.setAsyncValidators(PasswordValidator);
      this.authForm.updateValueAndValidity();
      this.authForm.get('confirmPassword').setValidators([Validators.required, Validators.minLength(5)]);
      this.authForm.get('confirmPassword').updateValueAndValidity();
    } else {
      this.isLogin = true;
      this.authForm.clearAsyncValidators();
      this.authForm.updateValueAndValidity();
      this.authForm.get('confirmPassword').clearValidators();
      this.authForm.get('confirmPassword').updateValueAndValidity();
    }
  }

  passwordMatch() {
    const password = this.authForm.get('password').value;
    const confirmPassword = this.authForm.get('confirmPassword').value;
    if (password && confirmPassword && password === confirmPassword) {
      return true;
    }
    return false;
  }

}
