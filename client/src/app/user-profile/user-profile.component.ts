import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PhoneNumberValidator } from '../cart/phone-number.validator';
import { AuthService } from '../auth/auth.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MapMarker } from '@angular/google-maps';
import { Animations } from '../shared/animations';

export interface UserInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [Animations.flyIn]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  displayInfo: boolean = false;
  editMode: boolean = false;
  userId: string;
  userEmail: string;
  userInfo: UserInfo;
  formSubmitted: boolean = false;
  isLoading: boolean = false;
  updateSuccess: boolean = false;
  querySub: Subscription;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.formSubmitted = false;
    this.updateSuccess = false;
    this.editMode = false;
    this.displayInfo = false;
    this.initForm();
    this.userId = this.authService.getUser().userId;

    this.querySub = this.route.queryParams.subscribe((queryParams) => {
      const complete = queryParams['complete'];
      if (complete === 'false') {
        this.displayInfo = true;
      }
    })

    this.authService.retrieveUserInfo(this.userId).subscribe(result => {
      if (!result.user) {
        return;
      }
      let initEmail = result.user.email;
      this.userEmail = result.user.email;
      let initFirstName = result.user.firstName;
      let initLastName = result.user.lastName;
      let initAddress = result.user.address;
      let initCity = result.user.city;
      let initPhoneNumber = result.user.phoneNumber;

      this.userInfo = {
        firstName : result.user.firstName || null,
        lastName: result.user.lastName || null,
        address: result.user.address || null,
        city: result.user.city || null,
        phoneNumber: result.user.phoneNumber || null
      }
      this.userForm.setValue({
        email: initEmail || null,
        firstName: initFirstName || null,
        lastName: initLastName || null,
        address: initAddress || null,
        city: initCity || null,
        phoneNumber: initPhoneNumber || null
      })
      this.isLoading = false;
    });
  }

  initForm() {
    this.userForm = new FormGroup({
      email: new FormControl({value: null, disabled: true}),
      firstName: new FormControl({value: null, disabled: true}, Validators.required),
      lastName: new FormControl({value: null, disabled: true}, Validators.required),
      address: new FormControl({value: null, disabled: true}, Validators.required),
      city: new FormControl({value: null, disabled: true}, Validators.required),
      phoneNumber: new FormControl({value: null, disabled: true}, [Validators.required, Validators.maxLength(14)], PhoneNumberValidator)
    })
  }

  updateUserInfo() {
    if (this.userForm.invalid) {
      return;
    }
    this.isLoading = true;
    const userInfo: UserInfo = {
      firstName: this.userForm.value.firstName,
      lastName: this.userForm.value.lastName,
      address: this.userForm.value.address,
      city: this.userForm.value.city,
      phoneNumber: this.userForm.value.phoneNumber.split(/\s/).join('')
    };
    this.authService.updateUserInfo(
      this.userId,
      this.userForm.value.email,
      userInfo
      )
    .subscribe((result) => {
      this.formSubmitted = true;
      this.isLoading = false;
      this.updateSuccess = true;
      this.editMode = false;
      this.displayInfo = false;
      this.userForm.get('firstName').disable();
      this.userForm.get('lastName').disable();
      this.userForm.get('address').disable();
      this.userForm.get('city').disable();
      this.userForm.get('phoneNumber').disable();
    },
    (errorMessage) => {
      console.log(errorMessage);
      this.isLoading = false;
    }
    );
  }

  switchToEdit() {
    this.editMode = true;
    this.updateSuccess = false;
    this.userForm.get('firstName').enable();
    this.userForm.get('lastName').enable();
    this.userForm.get('address').enable();
    this.userForm.get('city').enable();
    this.userForm.get('phoneNumber').enable();
  }

  switchToView() {
    this.editMode = false;
    this.resetForm();
    this.userForm.patchValue({email: this.userEmail});
    this.userForm.get('firstName').disable();
    this.userForm.get('lastName').disable();
    this.userForm.get('address').disable();
    this.userForm.get('city').disable();
    this.userForm.get('phoneNumber').disable();
  }

  resetForm() {
    this.userForm.patchValue({
      firstName: this.userInfo.firstName,
      lastName: this.userInfo.lastName,
      address: this.userInfo.address,
      city: this.userInfo.city,
      phoneNumber: this.userInfo.phoneNumber
    })
  }

  openDialog() : MatDialogRef<DialogEditChange> {
    return this.dialog.open(DialogEditChange, {
      width: '250px'
    });
  }

  canDeactivate() : Observable<boolean> | Promise<boolean> | boolean {
    if (this.formSubmitted) {
      return true;
    }
    const firstName = this.userForm.get('firstName').value;
    const lastName = this.userForm.get('lastName').value;
    const address = this.userForm.get('address').value;
    const city = this.userForm.get('city').value;
    const phoneNumber = this.userForm.get('phoneNumber').value;
    if (this.editMode) {
      if(
        firstName !== this.userInfo.firstName ||
        lastName !== this.userInfo.lastName ||
        address !== this.userInfo.address ||
        city !== this.userInfo.city ||
        phoneNumber !== this.userInfo.phoneNumber
      ) {
        return this.openDialog().afterClosed().pipe(map(response => {
          if (!response || response === undefined) {
            return false;
          }  else if (response) {
            return true;
          }
        }));
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.querySub.unsubscribe();
  }
}

@Component({
  selector: 'dialog-edit-change',
  templateUrl: 'dialog-edit-change.html',
})
export class DialogEditChange {
  constructor(public dialogRef: MatDialogRef<DialogEditChange>) {}

  onClick(response: boolean) {
    this.dialogRef.close(response);
  }

}
