import { HttpInterceptor, HttpRequest, HttpHandler, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private _errorSnackBar: MatSnackBar, private router: Router) {}

  intercept(req : HttpRequest<any>, next : HttpHandler) {
    return next.handle(req).pipe(
      catchError((error : HttpErrorResponse) => {
        console.log(error);
        let errorMessage = 'Une erreur s\'est produite. Veuillez réessayer';

        if (!error.error) {
          return throwError(errorMessage);
        }

        if (error.error.message){
          switch(error.error.message) {
            // Signup
            case '[Error] : Signup Fail - Email already exists':
              errorMessage = 'Email existant, veuillez en choisir un autre';
              break;
            case '[Error] : Signup Fail - Incorrect password confirmation':
            case '[Error] : Reset Password Fail - Incorrect password confirmation':
              errorMessage = 'Confirmation du mot de passe incorrecte';
              break;
            // Login
            case '[Error] : Authentication fail - User not found':
              errorMessage = 'Utilisateur non trouvé';
              break;
            case '[Error] : Authentication fail - Password not correct':
              errorMessage = 'Mot de passe incorrect';
              break;
            case '[Error] : Reset fail - Change password not correct':
              errorMessage = 'Veuillez choisir un mot de passe différent';
              break;
            case '[Error] : Authorization fail - Users not found':
              errorMessage = 'Utilisateurs non trouvés';
              break;
            // Token
            case '[Error] : Authentication fail - No token found':
              errorMessage = 'Veuillez vous connecter';
              break;
            // Products
            case '[Error] : Authorization Delete fail':
              errorMessage = 'Vous ne pouvez pas supprimer ce produit'
              break;
            // Upload
            case '[Error] : Upload fail - Mime type not authorized':
              errorMessage = 'Format non pris en charge, veuillez en choisir un autre';
              break;
            case '[Error] : Upload fail - Error occurred while uploading files':
              errorMessage = 'Erreur lors de l\'upload du fichier, veuillez réessayer'
          }
        }

        if (error.error.message === '[Error] : Admin authentication fail') {
          this.router.navigate(['/']);
          return throwError(errorMessage);
        }

        if (error.error.message === '[Error] : Authentication fail - Reset token not found') {
          this.router.navigate(['/']);
          return throwError(errorMessage);
        }

        this._errorSnackBar.open(errorMessage, 'Fermer', {duration : 5000});

        return throwError(errorMessage);
      })
    );
  }
}
