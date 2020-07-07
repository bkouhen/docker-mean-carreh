import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from './products.component';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

const BACKEND_URL = environment.apiUrl + '/products';

@Injectable({providedIn: 'root'})
export class ProductsService {
  products: Product[];
  productsUpdated = new Subject<Product[]>()

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  addProduct(product: Product) {
    if (typeof(product.image) === 'string') {
      return;
    }
    let productData = new FormData();
    productData.append('title', product.title);
    productData.append('category', product.category);
    productData.append('subCategory', product.subCategory);
    productData.append('image', product.image);
    productData.append('price', product.price.toString());
    productData.append('description', product.description);
    return this.http.post<{message: string, product: Product}>(BACKEND_URL + '/create', productData);
  }

  getProduct(id: string) {
    return this.http.get<{message: string, product: Product}>(BACKEND_URL + '/' + id);
  }

  getProducts() {
    this.http.get<{message: string, products: Product[]}>(BACKEND_URL)
      .subscribe(
        (resData) => {
          this.products = resData.products;
          this.productsUpdated.next(this.products.slice());
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
  }

  updateProduct(id: string, product: Product) {
    let productData : Product | FormData;
    if (typeof(product.image) === 'object') {
      productData = new FormData();
      productData.append('title', product.title);
      productData.append('category', product.category);
      productData.append('subCategory', product.subCategory);
      productData.append('image', product.image);
      productData.append('price', product.price.toString());
      productData.append('description', product.description);
    } else {
      productData = product;
    }
    return this.http.put<{message: string}>(BACKEND_URL + '/update/' + id, productData);
  }

  deleteProduct(id: string) {
    return this.http.delete<{message: string}>(BACKEND_URL + '/' + id);
  }


}
