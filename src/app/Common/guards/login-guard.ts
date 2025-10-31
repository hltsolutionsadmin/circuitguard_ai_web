import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../../auth/Services/auth';
import { inject } from '@angular/core';
import { CommonService } from '../services/common-service';

export const loginGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(Auth);
  const router = inject(Router);
  const commonService = inject(Auth);

  const token = authService.getToken();

   if (token && commonService.hasRole('ROLE_BUSINESS_ADMIN')) {
    return router.parseUrl('/layout');
  }

  if (token && authService.isLoggedIn()) {
    return router.parseUrl('/layout');
  }
  return true;
};
