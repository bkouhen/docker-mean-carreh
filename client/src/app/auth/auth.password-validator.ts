import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

export const PasswordValidator = (control: FormGroup): Promise<any> | Observable<any> => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  const pwObs = Observable.create((observer) => {
    if (password && confirmPassword && password.value === confirmPassword.value ) {
      observer.next(null)
    } else {
      observer.next({invalidPasswordMatch: true})
    }
    observer.complete();
  });
  return pwObs;
};
