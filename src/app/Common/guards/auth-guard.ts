import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../../auth/Services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) : boolean | UrlTree => {
 const authService = inject(Auth);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    return true;
  } else {
    return router.parseUrl('/login');
  }
};
