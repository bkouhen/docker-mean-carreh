import { AuthService } from './auth.service';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private authService : AuthService) {}

  intercept(req : HttpRequest<any>, next : HttpHandler) {
    const xsrfToken = this.authService.getXsrfToken();
    const modifiedRequest = req.clone({
      headers : new HttpHeaders().set('Authorization', 'Bearer ' + xsrfToken),
      withCredentials: true
    })
    return next.handle(modifiedRequest);
  }
}
