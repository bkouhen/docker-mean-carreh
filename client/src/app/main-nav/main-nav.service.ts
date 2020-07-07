import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn : 'root'})
export class MainNavService {
  scrollHeaderToggle = new Subject<boolean>();
  scrollMobileHeaderToggle = new Subject<boolean>();
  scrollValue = new Subject<number>();

  toggleScroll(bool:boolean) {
    this.scrollHeaderToggle.next(bool);
  }

  emitScrollValue(value: number) {
    this.scrollValue.next(value);
  }
}
