import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TvTurnService {
  private readonly http = inject(HttpClient);

  public getDeskDepartment(){
    return this.http.get(environment.apiUrl + '/desk/enabled', {});
  }

  public getTodayDeskDepartment(){
    return this.http.get(environment.apiUrl + '/turn/screen/today', {});
  }
}
