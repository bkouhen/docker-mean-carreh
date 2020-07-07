import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Animations } from '../shared/animations';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  animations: [Animations.flyIn]
})
export class PasswordResetComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.resetPasswordForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email])
    })
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.resetPasswordForm.value.email

    this.authService.resetPassword(email).subscribe(
      (res) => {
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

  openDialog() : MatDialogRef<DialogResetEmailSent> {
    return this.dialog.open(DialogResetEmailSent, {
      width: '400px'
    });
  }

}

@Component({
  selector: 'dialog-subscribe',
  templateUrl: 'dialog-reset-email-sent.html',
})
export class DialogResetEmailSent {
  constructor(public dialogRef: MatDialogRef<DialogResetEmailSent>) {}

}
