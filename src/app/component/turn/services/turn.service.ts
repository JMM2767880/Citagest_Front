import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TurnService {
  private readonly http = inject(HttpClient);

  public getDayTurn() {
    return this.http.get(environment.apiUrl + '/turn/today', { withCredentials: true });
  }

  public callTurn(turn: any){
    return this.http.put(environment.apiUrl + '/turn/call', turn, { withCredentials: true });
  }

  public finishTurn(turnId: number){
    return this.http.put(environment.apiUrl + '/turn/finish/' + turnId, {}, { withCredentials: true });
  }

  public discardTurn(turnId: number){
    return this.http.put(environment.apiUrl + '/turn/discard/' + turnId, {}, { withCredentials: true });
  }

  public getDayTurnScreen() {
    return this.http.get(environment.apiUrl + '/turn/screen/today', { });
  }

}
