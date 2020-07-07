import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { UserInfo } from '../user-profile/user-profile.component';

const BACKEND_URL = environment.apiUrl + '/users';

export interface AuthData {
  email: string;
  password: string;
  confirmPassword: string;
}

@Injectable({providedIn : 'root'})
export class AuthService {
  private authStatusListener = new BehaviorSubject<boolean>(null);
  private xsrfToken : string;
  private tokenExpirationTimer : any;
  private userId : string;
  private userEmail : string;
  private users;
  usersUpdated = new Subject<any>();
  isAdmin: boolean = false;
  adminListener = new BehaviorSubject<boolean>(false);

  constructor(private http:HttpClient, private router : Router) {}

  signup(authData: AuthData) {
    return this.http.post<{message:string, xsrfToken:string, expiresIn:number, userId:string, userEmail:string}>(BACKEND_URL + '/signup', authData)
    .pipe(
      tap((resData) => {
        this.handleAuthentication(resData.xsrfToken, resData.expiresIn, resData.userId, resData.userEmail);
      }))
  }

  login(authData: AuthData) {
    return this.http.post<{message:string, xsrfToken:string, expiresIn:number, userId:string, userEmail:string}>(BACKEND_URL + '/login', authData)
    .pipe(
      tap((resData) => {
        this.handleAuthentication(resData.xsrfToken, resData.expiresIn, resData.userId, resData.userEmail);
      })
    )
  }

  sendContactMail(contactData: {name: string, email: string, message: string}) {
    return this.http.post<{message: string}>(BACKEND_URL + '/contact', contactData)
  }

  getUsers() {
    this.http.get<{message: string, users: any}>(BACKEND_URL).subscribe(
      (resData) => {
        this.users = resData.users;
        this.usersUpdated.next(this.users.slice());
      },
      (error) => {
        console.log(error);
        this.router.navigate(['/']);
      }
    );
  }

  deleteUser(id: string) {
    return this.http.delete<{message: string}>(BACKEND_URL + '/delete/' + id);
  }

  checkAdmin() {
    this.http.get<{isAdmin: boolean}>(BACKEND_URL + '/admin/isAdmin').subscribe(
      (isAdmin) => {
        //console.log(isAdmin);
        if (isAdmin.isAdmin) {
          this.adminListener.next(true);
        } else {
          this.adminListener.next(false);
        }
      },
      (error) => {
        console.log(error);
        this.adminListener.next(false);
      }
    );
  }

  checkProfileComplete(id: string) {
    return this.http.get<{profileComplete: boolean}>(BACKEND_URL + '/profileComplete/' + id);
  }

  resetPassword(email: string) {
    const userData = { email: email};
    return this.http.post<{message: string}>(BACKEND_URL + '/resetPassword', userData);
  }

  checkResetPasswordToken(token: string) {
    return this.http.get<{message: string, email: string, userId: string}>(BACKEND_URL + '/resetPassword/' + token);
  }

  setNewPassword(userData: any) {
    return this.http.put<{message: string}>(BACKEND_URL + '/setNewPassword', userData);
  }

  autoLogin() {
    const userData : {xsrfToken : string, expirationDate:string, userId:string, userEmail:string} = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }
    if (!userData.xsrfToken || !userData.expirationDate) {
      return;
    }
    const expirationDuration = new Date(userData.expirationDate).getTime() - new Date().getTime();
    if (expirationDuration > 0) {
      this.xsrfToken = userData.xsrfToken;
      this.userId = userData.userId;
      this.userEmail = userData.userEmail;
      this.authStatusListener.next(true);
      this.checkAdmin();
      this.setLogoutTimer(expirationDuration);
    }
  }

  private handleAuthentication(xsrfToken:string, expiresIn:number, userId:string, userEmail:string) {
    this.xsrfToken = xsrfToken;
      if (xsrfToken) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.authStatusListener.next(true);
        this.checkAdmin();
        const expirationDate = new Date(new Date().getTime() + expiresIn*1000);
        const userData = {
          xsrfToken : xsrfToken,
          expirationDate : expirationDate,
          userId : userId,
          userEmail : userEmail
        }
        this.setLogoutTimer(expiresIn*1000);
        localStorage.setItem('userData', JSON.stringify(userData));
      }
  }

  setLogoutTimer(expirationDuration:number) {
    if (!this.tokenExpirationTimer) {
      const durationLeft = new Date(expirationDuration).toISOString().slice(11,19) ;
      //console.log("Token Time Left : " + durationLeft);
      this.tokenExpirationTimer = setTimeout(() => {
        this.logout();
      }, expirationDuration)
    }
  }

  clearLogoutTimer() {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
  }

  logout() {
    this.http.get<any>(BACKEND_URL + '/logout').subscribe(
      () => {
        this.xsrfToken = null;
        this.userId = null;
        this.userEmail = null;
        this.authStatusListener.next(false);
        this.adminListener.next(false);
        this.router.navigate(['/']);
        localStorage.removeItem('userData');
        this.clearLogoutTimer();
      }
    )

  }

  getXsrfToken() {
    return this.xsrfToken;
  }

  getUser() {
    return {
      userId : this.userId,
      userEmail : this.userEmail
    };
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  updateUserInfo(id: string, email: string, userInfo : UserInfo) {
    const userData = {
      id : id,
      email: email,
      userInfo: userInfo
    }
    return this.http.put<{message: string}>(BACKEND_URL + '/update/' + id, userData);
  }

  updateUserReadStatus(id: string) {
    return this.http.put<{message: string}>(BACKEND_URL + '/updateReadStatus/' + id, {});
  }

  retrieveUserInfo(id: string) {
    return this.http.get<{
      message: string,
      user: {
        email: string,
        firstName: string,
        lastName: string,
        address: string,
        city: string,
        phoneNumber:string
        }
      }>(BACKEND_URL + '/' + id);
  }

}
