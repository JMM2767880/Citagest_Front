import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  if (sessionService.currentUser) {
    return true;
  }

  return sessionService.loadMe().pipe(
    map((user) => user ? true : router.createUrlTree(['/'])),
    catchError(() => of(router.createUrlTree(['/'])))
  );
};
