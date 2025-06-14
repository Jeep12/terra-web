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

  createAccountGame(account: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/game/auth/registerGameAccount`, account);
  }

  getAccountsGame(email: string): Observable<AccountGameResponse[]> {
    return this.http.get<AccountGameResponse[]>(`${environment.apiUrl}api/game/auth/accounts?email=${email}`);
  }

  sendResetCode(accountName: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/game/auth/reset-code?accountName=${accountName}`, {});
  }

  sendCreateCode(): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/game/auth/create-code`, {});
  }
    changePassword(dto: { code: string, newPassword: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/game/auth/changePassword`, dto);
  }

}
