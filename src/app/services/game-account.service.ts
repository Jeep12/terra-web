import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { AccountGameResponse, GameAccount } from '../models/game.account.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameAccountService {

  constructor(private http: HttpClient) { }


  createAccountGame(account: GameAccount): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/auth/register`, account);
  }
  getAccountsGame(email: string): Observable<AccountGameResponse[]> {
    return this.http.get<AccountGameResponse[]>(`${environment.apiUrl}api/game/auth/accounts?email=${email}`, { withCredentials: true });

  }
  sendResetCode(accountName: string): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}api/game/auth/reset-code?accountName=${accountName}`,
      {},
      { withCredentials: true }
    );
  }



}
