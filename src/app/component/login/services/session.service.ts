import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userSubject = new BehaviorSubject<any>(null);
  public readonly user$ = this.userSubject.asObservable();

  constructor(private readonly loginService: LoginService) {}

  get currentUser(): any {
    return this.userSubject.value;
  }

  setUser(user: any): void {
    this.userSubject.next(user);
  }

  loadMe(): Observable<any> {
    return this.loginService.me().pipe(
      tap((user) => this.userSubject.next(user))
    );
  }

  clear(): void {
    this.userSubject.next(null);
  }

  isLogged(): boolean {
    return this.userSubject.value !== null;
  }
}
