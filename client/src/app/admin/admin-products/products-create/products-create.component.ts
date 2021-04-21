import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { mimeTypeValidator } from './mime-type.validator';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ProductsService } from 'src/app/products/products.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Product } from 'src/app/products/products.component';
import { map } from 'rxjs/operators';
import { CategoriesService } from '../../admin-categories/categories.service';

@Component({
  selector: 'app-products-create',
  templateUrl: './products-create.component.html',
  styleUrls: ['./products-create.component.scss']
})
export class ProductsCreateComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  formSubmitted: boolean = false;
  isLoading: boolean  = false;
  imagePreview: string;
  editMode: boolean = false;
  product: Product;
  productId: string;
  categoriesSub: Subscription;
  categories= [];
  subCategories = [];
  categoryValueChangeSub: Subscription;

  constructor(private productsService: ProductsService, private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    this.route.params.subscribe(
      (params: Params) => {
        if (params['id']) {
          const productId = params['id'];
          this.productId = productId;
          this.editMode = true;
          this.productsService.getProduct(productId).subscribe(
            (resData) => {
              this.isLoading = false;
              const fetchedProduct = resData.product;
              this.product = fetchedProduct;
              this.productForm.setValue({
                title: fetchedProduct.title,
                category: fetchedProduct.category,
                subCategory: fetchedProduct.subCategory,
                image: fetchedProduct.image,
                price: fetchedProduct.price,
                description: fetchedProduct.description
              })
            },
            (errorMessage) => {
              console.log(errorMessage);
              this.isLoading = false;
            }
          )
        } else {
          this.productId = null;
          this.isLoading = false
        }
      }
    );

    this.categoriesSub = this.categoriesService.categoriesUpdated.subscribe(
      (categories) => {
        this.categories = categories;
        if (this.productForm) {
          this.productForm.get('category').enable();
        }
        this.categoryValueChangeSub = this.productForm.get('category').valueChanges.subscribe(
          (value) => {
            if (value) {
              const searchedCategory = this.categories.find(category => category.title === value)
              const mappedSubCategories = searchedCategory.subCategories.map(sub => {
                return {title: sub}
              });
              this.subCategories = [];
              this.subCategories = [...mappedSubCategories];
              this.productForm.get('subCategory').enable();
              this.productForm.get('subCategory').reset();
            }
          }, (errorMessage) => {
            console.log(errorMessage);
          }
        );
      }, (errorMessage) => {
        console.log(errorMessage);
      }
    );

  }

  initForm() {
    this.productForm = new FormGroup({
      title: new FormControl(null, Validators.required),
      category: new FormControl({value: null, disabled: true}, Validators.required),
      subCategory: new FormControl({value: null, disabled: true}, Validators.required),
      image: new FormControl(null, Validators.required, mimeTypeValidator),
      price: new FormControl(null, Validators.required),
      description: new FormControl(null, Validators.required)
    })

  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.formSubmitted = true;

    let productObs: Observable<any>;

    const productData: Product = {
      title: this.productForm.value.title,
      category: this.productForm.value.category,
      subCategory: this.productForm.value.subCategory,
      image: this.productForm.value.image,
      price: this.productForm.value.price,
      description: this.productForm.value.description,
    }

    if (this.editMode) {
      productObs = this.productsService.updateProduct(this.productId, productData);
    } else {
      productObs = this.productsService.addProduct(productData);
    }

    productObs
      .subscribe(
        () => {
          if (this.editMode) {
            this.router.navigate(['../../'], {relativeTo: this.route});
          } else {
            this.router.navigate(['../'], {relativeTo: this.route});
          }
        },
        (errorMessage) => {
          console.log(errorMessage);
          this.isLoading = false;
        }
      )
  }

  onResetForm() {
    this.productForm.reset();
  }

  onImagePick(event : Event) {
    if ((event.target as HTMLInputElement).files.length === 0) {
      return;
    }
    const file = (event.target as HTMLInputElement).files[0];
    this.productForm.patchValue({
      'image' : file
    })
    this.productForm.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    }
    reader.readAsDataURL(file);
  }

  ngOnDestroy() {
    this.categoriesSub.unsubscribe();
    this.categoryValueChangeSub.unsubscribe();
  }

  canDeactivate() : Observable<boolean> | Promise<boolean> | boolean {
    const title = this.productForm.get('title').value;
    const category = this.productForm.get('category').value;
    const subCategory = this.productForm.get('subCategory').value
    const image = this.productForm.get('image').value;
    const price = this.productForm.get('price').value;
    const description = this.productForm.get('description').value;

    if (this.formSubmitted) {
      return true;
    }

    if (!this.product) {
      return true;
    }

    if (this.editMode) {
      if (
        title !== this.product.title ||
        category !== this.product.category ||
        subCategory !== this.product.subCategory ||
        typeof(image) === 'object' ||
        price !== this.product.price ||
        description !== this.product.description ) {
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
      if (
        (title !== null && title !== '') ||
        (category !== null && category !== '') ||
        (subCategory !== null && subCategory !== '') ||
        image != null ||
        (price !== null && price !== '') ||
        (description !== null && description !== '')
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
    }
  }

  openDialog() : MatDialogRef<DialogDeactivate> {
    return this.dialog.open(DialogDeactivate, {
      width: '250px'
    });
  }

}

@Component({
  selector: 'dialog-deactivate',
  templateUrl: 'dialog-deactivate-guard.html',
})
export class DialogDeactivate {
  constructor(public dialogRef: MatDialogRef<DialogDeactivate>) {}

  onClick(response: boolean) {
    this.dialogRef.close(response);
  }

}
