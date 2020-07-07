import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeTypeValidator } from '../admin-products/products-create/mime-type.validator';
import { BackgroundService, Background } from './background.service';

@Component({
  selector: 'app-admin-background',
  templateUrl: './admin-background.component.html',
  styleUrls: ['./admin-background.component.scss']
})
export class AdminBackgroundComponent implements OnInit {
  imgForm = [new FormControl(), new FormControl(), new FormControl()];
  isLoading: boolean = false;
  imgP = ['', '', ''];
  background = [];

  constructor(private backgroundService: BackgroundService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.backgroundService.getBackgroundImages().subscribe(
      (resData) => {
        const BkgSorted = resData.background.slice().sort(this.comparePosition);
        this.background = BkgSorted;
        this.isLoading = false;
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    );
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

  onSubmit() {
    if (this.imgForm[0].invalid && this.imgForm[1].invalid && this.imgForm[2].invalid) {
      return;
    }
    this.isLoading = true;
    const backgroundData = [this.imgForm[0].value, this.imgForm[1].value, this.imgForm[2].value];
    this.backgroundService.updateBackgroundImages(backgroundData).subscribe(
      (resData) => {
        this.isLoading = false;
        this.onResetForm();
        this.ngOnInit();
      },
      (errorMessage) => {
        console.log(errorMessage)
        this.isLoading = false;
      }
    )
  }

  onDelete(position: number) {
    this.backgroundService.deleteBackgroundImage(position).subscribe(
      (resData) => {
        this.ngOnInit();
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    )
  }

  onResetForm() {
    for (var i = 0; i < 3; i++) {
      this.imgForm[i].reset()
      this.imgP[i] = null;
    }
  }

  onImagePick(event: Event, id: number) {
    if ((event.target as HTMLInputElement).files.length === 0) {
      return;
    }
    const file = (event.target as HTMLInputElement).files[0];
    this.imgForm[id].patchValue(file);
    this.imgForm[id].updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imgP[id] = reader.result as string;
    }
    reader.readAsDataURL(file);
  }

}
