import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  return loginService.me().pipe(
    map(() => router.createUrlTree(['/dashboard'])),
    catchError(() => of(true))
  );
};
