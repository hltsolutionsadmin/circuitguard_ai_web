import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '../../auth/Services/auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
   constructor(
    private authService: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let token: string | null = null;

    if (isPlatformBrowser(this.platformId)) {
      token = this.authService.getToken();
    }

    // Skip login and refresh APIs
    if (req.url.includes('/login') || req.url.includes('/refreshToken')) {
      return next.handle(req);
    }

    const cloned = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService.refreshAccessToken().pipe(
            switchMap((response) => {
              const newToken = response.token;
              const newRefresh = response.refreshToken;
              this.authService.saveTokens(newToken, newRefresh);

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next.handle(retryReq);
            })
          );
        }
        return throwError(() => error);
      })
    );
  }
}
