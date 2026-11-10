import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);

  login(data: { username: string; password: string }) {
    return this.http.post(environment.apiUrl + '/auth/login', data, { withCredentials: true });
  }

  logout() {
    return this.http.post(environment.apiUrl + '/auth/logout', {}, { withCredentials: true });
  }

  me() {
    return this.http.get(environment.apiUrl + '/auth/me', { withCredentials: true });
  }
}
