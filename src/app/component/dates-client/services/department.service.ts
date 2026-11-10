import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);

  getDepartments() {
    return this.http.get(environment.apiUrl + '/department', { withCredentials: true });
  }
}