import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CategoriesService, Category } from '../categories.service';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogDeactivate } from '../../admin-products/products-create/products-create.component';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.scss']
})
export class CategoryCreateComponent implements OnInit {
  categoryForm: FormGroup;
  formSubmitted: boolean = false;
  isLoading: boolean  = false;
  editMode: boolean = false;
  category;
  categoryId: string;

  constructor(private route: ActivatedRoute, private categoriesService: CategoriesService, private router: Router, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
        this.categoryId = params['id'];
        if (params['id']) {
          this.editMode = true;
        }
        this.initForm();
          }
        );
  }

  onSubmit() {
    if (this.categoryForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.formSubmitted = true;

    let categoryObs: Observable<any>;

    const categoryData: Category = {
      title: this.categoryForm.value.title,
      subCategories: this.categoryForm.value.subCategories
    }

    if (this.editMode) {
      categoryObs = this.categoriesService.updateCategory(this.categoryId, categoryData);
    } else {
      categoryObs = this.categoriesService.addCategory(categoryData);
    }

    categoryObs
      .subscribe(
        (resData) => {
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

  initForm() {
    let title = new FormControl(null, Validators.required);
    let subCategories = new FormArray([]);

    if (this.editMode) {
      this.isLoading = true;
      this.categoriesService.getCategory(this.categoryId).subscribe(
        (resData) => {
          this.isLoading = false;
          const fetchedCategory = resData.category;
          this.category = fetchedCategory;

          title.setValue(fetchedCategory.title);
          for (let subCategory of fetchedCategory.subCategories) {
            subCategories.push(
              new FormControl(subCategory, Validators.required)
            )
          }
        },
        (errorMessage) => {
          console.log(errorMessage);
          this.isLoading = false;
        }
      );
    }

    this.categoryForm = new FormGroup({
      title: title,
      subCategories: subCategories
    });
  }

  get subControls() {
    return (<FormArray>this.categoryForm.get('subCategories')).controls;
  }

  onAddSubCategory() {
    (<FormArray>this.categoryForm.get('subCategories')).push(
      new FormControl(null, Validators.required)
    )
  }

  onRemoveSubCategory(index: number) {
    (<FormArray>this.categoryForm.get('subCategories')).removeAt(index);
  }

  onRemoveAllSubCategories() {
    (<FormArray>this.categoryForm.get('subCategories')).clear();
  }

  checkSubCategoriesLength() {
    return (<FormArray>this.categoryForm.get('subCategories')).length === 0;
  }

  onResetForm() {
    this.categoryForm.reset();
  }

  canDeactivate() : Observable<boolean> | Promise<boolean> | boolean {
    const title = this.categoryForm.value.title;
    const subCategories = this.categoryForm.value.subCategories;

    if (this.formSubmitted) {
      return true;
    }

    if (!this.category) {
      return true;
    }

    if (this.editMode) {
      if (
        title !== this.category.title ||
        !this.similarArrays(subCategories, this.category.subCategories)) {
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
        (subCategories !== null && subCategories.length !== 0 && !this.emptySubCategories(subCategories)))
         {
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

  emptySubCategories(subCategories: string[]) {
    if (subCategories.length === 0) {
      return true
    }
    let empty = true;

    for (let subCategory of subCategories) {
      if (subCategory && subCategory !== '') {
        empty = false;
      }
    }
    return empty;
  }

  similarArrays(sub1: string[], sub2: string[]) {
    if (!sub1 || !sub2 || sub1.length !== sub2.length) {
      return false;
    }
    let similar = true;
    for (let sub of sub1) {
      const index = sub1.indexOf(sub);
      if (sub !== sub2[index]) {
        similar = false
      }
    }
    return similar;
  }

  openDialog() : MatDialogRef<DialogDeactivate> {
    return this.dialog.open(DialogDeactivate, {
      width: '250px'
    });
  }

}

