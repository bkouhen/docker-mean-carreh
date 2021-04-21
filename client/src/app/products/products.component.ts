import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from './products.service';
import { Subscription } from 'rxjs';
import { CartService, Cart } from '../cart/cart.service';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { take, tap, switchMap } from 'rxjs/operators';
import { CategoriesService, Category } from '../admin/admin-categories/categories.service';
import { Animations } from '../shared/animations';

export interface Product {
  id?: string;
  hovered?: boolean;
  title: string;
  category: string;
  subCategory: string;
  image: string | File;
  price: number;
  description: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  animations: [Animations.flyIn]
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: any = [];
  filteredProducts: any = [];
  productsSub: Subscription;
  cartSub: Subscription;
  isLoading = false;
  cart: Cart;
  subCatControl = new FormControl();
  categories: Category[] = [];
  subCategories: string[] = [];
  querySub: Subscription;
  queryChangeSub: Subscription;
  type: string;
  sub: string;
  categoryValueChangeSub: Subscription;

  constructor(private productsService: ProductsService, private cartService: CartService, private route: ActivatedRoute, private categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.cartService.getCart();
    this.productsService.getProducts();

    this.queryChangeSub = this.route.queryParams.subscribe(
      (queryParams) => {
        if (!this.products || !this.categories || !this.subCategories) {
          return;
        }
        this.type = queryParams['type'];
        this.sub = queryParams['sub'];
        this.subCatControl.reset();
        let filteredProducts;
        if (!this.type) {
          filteredProducts = [...this.products];
        } else {
          filteredProducts = this.products.filter((product: Product) => product.category === this.type)
        }
        if (this.sub) {
          filteredProducts = this.products.filter((product: Product) => product.category === this.type && product.subCategory === this.sub)
          this.subCatControl.setValue(this.sub);
        } else {
          this.subCatControl.setValue('all-products');
        }
        this.filteredProducts = [];
        this.filteredProducts = [...filteredProducts];
        const searchedCategory = this.categories.find(category => category.title === this.type)
        let mappedSubCategories = [];
        if (searchedCategory && searchedCategory.subCategories) {
          mappedSubCategories = searchedCategory.subCategories;
        }
        this.subCategories = [];
        this.subCategories = [...mappedSubCategories];

      }
    );

    this.querySub = this.route.queryParams.pipe(
      take(1),
      tap((queryParams) => {
        this.type = queryParams['type'];
        this.sub = queryParams['sub'];
      }),
      switchMap(() => {
        return this.productsService.productsUpdated
      }),
      take(1),
      tap((products: any) => {
        const newProducts = products.map((product) => {
          const productId = product._id;
          return {...product, Qty: this.determinateQty(productId, this.cart)}
        });
        this.products = newProducts;
      }),
      switchMap(() => {
        return this.categoriesService.categoriesUpdated
      })
      )
    .subscribe(
      (categories: Category[]) => {
        this.isLoading = false;
        this.categories = categories;
        this.subCatControl.reset();
        let filteredProducts;
        if (!this.type) {
          filteredProducts = [...this.products];
        } else {
          filteredProducts = this.products.filter((product: Product) => product.category === this.type)
        }
        if (this.sub) {
          filteredProducts = this.products.filter((product: Product) => product.category === this.type && product.subCategory === this.sub)
          this.subCatControl.setValue(this.sub);
        } else {
          this.subCatControl.setValue('all-products');
        }
        this.filteredProducts = [];
        this.filteredProducts = [...filteredProducts];
        const searchedCategory = this.categories.find(category => category.title === this.type)
        let mappedSubCategories = [];
        if (searchedCategory && searchedCategory.subCategories) {
          mappedSubCategories = searchedCategory.subCategories;
        }
        this.subCategories = [];
        this.subCategories = [...mappedSubCategories];
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
      }
    );

    this.cartSub = this.cartService.cartUpdated.subscribe(
      (cart) => {
        this.cart = cart;
      }
    );

    this.categoryValueChangeSub = this.subCatControl.valueChanges.subscribe(
      (value) => {
        if (value && value !== 'all-products') {
          const filteredProducts = this.products.filter((product: Product) => product.subCategory === value)
          this.filteredProducts = [];
          this.filteredProducts = filteredProducts;
        }
        if (value && value === 'all-products') {
          const filteredProducts = this.products.filter((product: Product) => product.category === this.type)
          this.filteredProducts = [];
          this.filteredProducts = filteredProducts;
        }
      }, (errorMessage) => {
        console.log(errorMessage);
      }
    );
  }

  determinateQty(productId: string, cart: Cart) {
    let Qty = 0;
    const foundProducts = cart.items.filter(item => item.item.id.indexOf(productId) === 0);
    if (foundProducts.length === 1) {
      Qty = foundProducts[0].Qty;
    }
    return Qty;
  }

  onAddToCart(product: any) {
    product.Qty += 1;
    const productData: Product = {
        id: product._id,
        title: product.title,
        category: product.category,
        subCategory: product.subCategory,
        image: product.image,
        price: product.price,
        description: product.description
    };
    this.cartService.addToCart(productData);
  }

  onRemoveFromCart(product: any) {
    if (product.Qty === 0) {
      return;
    }
    product.Qty -= 1;
    this.cartService.removeFromCart(product._id);
  }

  ngOnDestroy() {
    this.cartSub.unsubscribe();
    this.querySub.unsubscribe();
    this.queryChangeSub.unsubscribe();
    this.categoryValueChangeSub.unsubscribe();
  }

}
