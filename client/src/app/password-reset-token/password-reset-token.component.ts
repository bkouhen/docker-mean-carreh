import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PasswordValidator } from '../auth/auth.password-validator';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Animations } from '../shared/animations';

@Component({
  selector: 'app-password-reset-token',
  templateUrl: './password-reset-token.component.html',
  styleUrls: ['./password-reset-token.component.scss'],
  animations: [Animations.flyIn]
})
export class PasswordResetTokenComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading: boolean = false;
  userEmail: string;
  userId: string;
  passwordToken: string;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    const token = this.route.snapshot.params['token'];
    if (!token) {
      this.router.navigate(['/']);
    }
    this.isLoading = true;
    this.authService.checkResetPasswordToken(token).subscribe(
      (resData) => {
        this.userEmail = resData.email;
        this.userId = resData.userId;
        this.passwordToken = token;
        this.isLoading = false;
        this.initForm();
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    );
  }

  initForm() {
    this.resetPasswordForm = new FormGroup({
      email: new FormControl({value: this.userEmail, disabled: true}, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5)]),
      confirmPassword: new FormControl(null, [Validators.required, Validators.minLength(5)]),
    });
    this.resetPasswordForm.setAsyncValidators(PasswordValidator);
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const userData = {
      email: this.userEmail,
      password: this.resetPasswordForm.value.password,
      confirmPassword: this.resetPasswordForm.value.confirmPassword,
      userId: this.userId,
      passwordToken: this.passwordToken
    }

    this.isLoading = true;

    this.authService.setNewPassword(userData).subscribe(
      (resData) => {
        this.openDialog();
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    );
  }

  passwordMatch() {
    const password = this.resetPasswordForm.get('password').value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword').value;
    if (password && confirmPassword && password === confirmPassword) {
      return true;
    }
    return false;
  }

  openDialog() : MatDialogRef<DialogResetPassword> {
    return this.dialog.open(DialogResetPassword, {
      width: '400px'
    });
  }


}


@Component({
  selector: 'dialog-subscribe',
  templateUrl: 'dialog-reset-password.html',
})
export class DialogResetPassword {
  constructor(public dialogRef: MatDialogRef<DialogResetPassword>) {}

}
