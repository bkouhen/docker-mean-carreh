import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, RouterLink } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { take, map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/users';

@Injectable({providedIn : 'root'})
export class AuthGuard implements CanActivate {

  constructor(private router : Router, private authService : AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
  boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authService.getAuthStatusListener().pipe(
      take(1),
      map(isAuth => {
        if (isAuth) {
          return true;
        }
        return this.router.createUrlTree(['/'])
      })
    );
  }
}

@Injectable({providedIn : 'root'})
export class AdminAuthGuard implements CanActivate {

  constructor(private router : Router, private authService : AuthService, private http: HttpClient) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
  boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.http.get<{isAdmin: boolean}>(BACKEND_URL + '/admin/isAdmin').pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin.isAdmin) {
          return true;
        }
        return this.router.createUrlTree(['/'])
      }),
      catchError((err) => {
        console.log(err);
        this.router.navigate(['/']);
        return throwError(err);
      })
    );

    /* return this.authService.adminListener.pipe(
      take(1),
      map(isAdmin => {
        console.log('isAdmin', isAdmin);
        if (isAdmin) {
          return true;
        }
        return this.router.createUrlTree(['/auth'])
      })
    ); */
  }
}

@Injectable({providedIn : 'root'})
export class NotAuthGuard implements CanActivate {

  constructor(private router : Router, private authService : AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
  boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authService.getAuthStatusListener().pipe(
      take(1),
      map(isAuth => {
        if (!isAuth) {
          return true;
        }
        return this.router.createUrlTree(['/'])
      })
    );
  }
}
