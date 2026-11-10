import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TemplateDateService {
  private readonly http: HttpClient = inject(HttpClient);

  addTemplatesDates(data: any, numberTemplate: number) {
    return this.http.post(environment.apiUrl + "/template-dates", data, { params: {numberTemplate: numberTemplate}, withCredentials: true });
  }

  getAllTemplatesDates(numberTemplate: number) {
    return this.http.get(environment.apiUrl + "/template-dates", { params: { numberTemplate: numberTemplate }, withCredentials: true });
  }
}
