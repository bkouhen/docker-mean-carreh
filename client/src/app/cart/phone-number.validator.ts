import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';

export const PhoneNumberValidator = (control: FormControl): Promise<any> | Observable<any> => {
  const phone = control.value
   const phoneObs = Observable.create((observer) => {
    if (phone && phone.split(/\s/).join('').length === 10) {
      observer.next(null)
    } else {
      observer.next({invalidPhoneNumber: true})
    }
    observer.complete();
  });
  return phoneObs;
};
