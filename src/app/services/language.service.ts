import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly http: HttpClient = inject(HttpClient);

  getLanguages() {
    return this.http.get(environment.apiUrl + "/language/all", { withCredentials: true });
  }
}
