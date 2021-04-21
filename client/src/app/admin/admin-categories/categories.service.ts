import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

const BACKEND_URL = environment.apiUrl + '/categories';

export interface Category {
  _id?: string;
  title: string;
  subCategories : string[];
}

@Injectable({providedIn: 'root'})
export class CategoriesService {
  categories: Category[];
  categoriesUpdated = new BehaviorSubject<Category[]>([])

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  addCategory(category: Category) {
    return this.http.post<{message: string, category: Category}>(BACKEND_URL + '/create', category);
  }


  getCategory(id: string) {
    return this.http.get<{message: string, category: Category}>(BACKEND_URL + '/' + id);
  }

  getCategories() {
    this.http.get<{message: string, categories: Category[]}>(BACKEND_URL)
      .subscribe(
        (resData) => {
          this.categories = resData.categories;
          this.categoriesUpdated.next(this.categories.slice());
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
  }

  updateCategory(id: string, category: Category) {
    return this.http.put<{message: string}>(BACKEND_URL + '/update/' + id, category);
  }

  deleteCategory(id: string) {
    return this.http.delete<{message: string}>(BACKEND_URL + '/' + id);
  }


}
