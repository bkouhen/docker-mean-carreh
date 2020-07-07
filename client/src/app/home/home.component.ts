import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarouselAnimation } from './carousel.animation';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BackgroundService, Background } from '../admin/admin-background/background.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [CarouselAnimation.fadeIn, CarouselAnimation.fadeOut]
})
export class HomeComponent implements OnInit, OnDestroy {
  carouselIndex: number = 0;
  carouselIntervalTimer;
  contactForm: FormGroup;
  urlSub: Subscription;
  bg1: string;
  bg2: string;
  bg3: string;
  background: Background[] = [];

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private backgroundService: BackgroundService
    ) {
    this. urlSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe((event: NavigationEnd) => {
      const tree = router.parseUrl(router.url);
      if (tree.fragment) {
        const element = document.querySelector('#' + tree.fragment);
        if (element) {
          element.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
      }
    })
  }

  ngOnInit(): void {
    this.backgroundService.getBackgroundImages().subscribe(
      (resData) => {
        if (!resData.background || resData.background.length === 0) {
          return;
        }
        const BkgSorted = resData.background.slice().sort(this.comparePosition);
        this.background = BkgSorted;
        this.bg1 = this.background.slice()[0].url;
        this.bg2 = this.background.slice()[1].url;
        this.bg3 = this.background.slice()[2].url;
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );

    this.carouselIntervalTimer = () => {
      setInterval(() => {
        this.carouselNext();
      }, 5000);
    };
    this.carouselIntervalTimer();
    this.initForm();
  }

  comparePosition(a: Background, b: Background) {
    const posA = a.position;
    const posB = b.position;

    let comparison = 0;
    if (posA > posB) {
      comparison = 1;
    } else if (posB > posA) {
      comparison = -1;
    }
    return comparison;
  }

  carouselNext() {
    let newIndex = 0;
    if (this.carouselIndex < 2) {
      newIndex = this.carouselIndex + 1;
    }
    this.carouselIndex = newIndex;
  }

  carouselPrevious() {
    let newIndex = 2;
    if (this.carouselIndex > 0) {
      newIndex = this.carouselIndex - 1;
    }
    this.carouselIndex = newIndex;
  }

  switchCarousel(imageIndex: number) {
    this.carouselIndex = imageIndex;
  }

  initForm() {
    this.contactForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      email: new FormControl(null, [Validators.required, Validators.email]),
      message: new FormControl(null, Validators.required)
    })
  }

  resetForm() {
    this.contactForm.reset();
  }

  submitContactForm() {
    const contactData = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      message: this.contactForm.value.message
    }
    this.authService.sendContactMail(contactData).subscribe(
      (resData) => {
        this.openSuccessDialog();
        this.resetForm();
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.openFailDialog();
      }
    )
  }

  openSuccessDialog() : MatDialogRef<DialogContactSent> {
    return this.dialog.open(DialogContactSent, {
      width: '400px'
    });
  }

  openFailDialog() : MatDialogRef<DialogContactFail> {
    return this.dialog.open(DialogContactFail, {
      width: '400px'
    });
  }

  ngOnDestroy() {
    this.urlSub.unsubscribe();
  }

}


@Component({
  selector: 'dialog-subscribe',
  templateUrl: 'dialog-contact-sent.html',
})
export class DialogContactSent {
  constructor(public dialogRef: MatDialogRef<DialogContactSent>) {}

}

@Component({
  selector: 'dialog-subscribe',
  templateUrl: 'dialog-contact-fail.html',
})
export class DialogContactFail {
  constructor(public dialogRef: MatDialogRef<DialogContactFail>) {}

}
