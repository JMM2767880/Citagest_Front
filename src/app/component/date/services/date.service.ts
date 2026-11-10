import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { env } from 'node:process';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private readonly http = inject(HttpClient);

  createDates(data: any) {
    return this.http.post(environment.apiUrl + '/dates', data, { withCredentials: true });
  }

  getDatesDepartment(departmentId: number) {
    return this.http.get(environment.apiUrl + '/dates/available/' + departmentId, { });
  }

  getDatesDepartmentsDate(departmentId: number, dateTime: any){
    return this.http.get(environment.apiUrl + '/dates/available/' + departmentId + '/' + dateTime, {});
  }

  setClientToDate(data: any) {
    return this.http.put(environment.apiUrl + '/dates', data, {});
  }

  getCountDatesByMonth(dateTime: any) {
    return this.http.get(environment.apiUrl + '/dates/totalDates/' + dateTime, {withCredentials: true});
  }

  public getDatesByDateTime(date: string){
    return this.http.get(environment.apiUrl + '/dates/' + date, { withCredentials: true });
  }

  public setClientToDateId(date: any){
    return this.http.put(environment.apiUrl + '/dates/setClient', date, { withCredentials: true });
  }

  public setEmptyClientToDate(date: any){
    return this.http.put(environment.apiUrl + '/dates/setEmptyClient', date, { withCredentials: true });
  }

  public searchByNameClient(nameClient: string){
    return this.http.get(environment.apiUrl + '/nameClient/' + nameClient, { withCredentials: true });
  }
}
