import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../../auth/Services/auth';
import { inject } from '@angular/core';

export const loginGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(Auth);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    return router.parseUrl('/layout');
  }
  return true;
};
