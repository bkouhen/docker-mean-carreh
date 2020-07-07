import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from 'src/app/products/products.service';
import { Product } from 'src/app/products/products.component';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Category, CategoriesService } from '../admin-categories/categories.service';
import { take, tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  products: any = [];
  productsSub: Subscription;
  isLoading = false;
  componentLoaded : boolean = false;
  filteredProducts: any;
  catControl = new FormControl();
  subCatControl = new FormControl();
  categories: Category[];
  subCategories;
  categoryValueChangeSub: Subscription;
  subCategoryValueChangeSub: Subscription;

  constructor(private productsService: ProductsService, private categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.productsService.getProducts();
    this.productsSub = this.productsService.productsUpdated.pipe(
      take(1),
      tap((products) => {
        this.products = products;
      }),
      switchMap(() => {
        return this.categoriesService.categoriesUpdated
      })
    )
    .subscribe(
      (categories: Category[]) => {
        this.isLoading = false;
        this.categories = categories;
        this.catControl.setValue('all-products');
        this.subCatControl.disable();
        this.filteredProducts = this.products;
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    );

    this.categoryValueChangeSub = this.catControl.valueChanges.subscribe(
      (value) => {
        let filteredProducts = [...this.products];
        this.subCatControl.reset();
        this.subCatControl.disable();
        if (value && value !== 'all-products') {
          filteredProducts = this.products.filter((product: Product) => product.category === value)
          this.subCatControl.enable();
          this.subCatControl.setValue('all-products');
          const searchedCategory = this.categories.find(category => category.title === value)
          const mappedSubCategories = searchedCategory.subCategories;
          this.subCategories = [];
          this.subCategories = [...mappedSubCategories];
        }
        this.filteredProducts = [];
        this.filteredProducts = filteredProducts;
      }, (errorMessage) => {
        console.log(errorMessage);
      }
    );

    this.subCategoryValueChangeSub = this.subCatControl.valueChanges.subscribe(
      (value) => {
        let filteredProducts;
        filteredProducts = this.products.filter((product: Product) => product.category === this.catControl.value)
        if (value && value !== 'all-products') {
          filteredProducts = this.products.filter((product: Product) => product.category === this.catControl.value && product.subCategory === value);
        }
        this.filteredProducts = [];
        this.filteredProducts = filteredProducts;
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    );
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.productsService.deleteProduct(id).subscribe(
      () => {
        this.ngOnInit();
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.ngOnInit();
      }
    )
  }

  onComponentLoaded(event) {
    this.componentLoaded = true;
  }

  onComponentUnloaded(event) {
    this.componentLoaded = false;
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.productsSub.unsubscribe();
    this.categoryValueChangeSub.unsubscribe();
    this.subCategoryValueChangeSub.unsubscribe();
  }

}
