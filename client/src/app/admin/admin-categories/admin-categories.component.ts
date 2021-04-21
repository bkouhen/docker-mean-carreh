import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoriesService, Category } from './categories.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  categoriesSub: Subscription;
  isLoading = false;
  componentLoaded : boolean = false;

  constructor(private categoriesService: CategoriesService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.categoriesService.getCategories();
    this.categoriesSub = this.categoriesService.categoriesUpdated.subscribe(
      (categories) => {
        this.categories = categories;
        this.isLoading = false;
      }
    );
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.categoriesService.deleteCategory(id).subscribe(
      () => {
        this.categoriesService.getCategories();
      },
      (errorMessage) => {
        console.log(errorMessage);
        this.categoriesService.getCategories();
      }
    )
  }

  onComponentLoaded(event) {
    this.componentLoaded = true;
  }

  onComponentUnloaded(event) {
    this.componentLoaded = false;
    this.categoriesService.getCategories();
  }

  ngOnDestroy() {
    this.categoriesSub.unsubscribe();
  }

}
