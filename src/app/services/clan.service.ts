import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Clan } from '../models/clan.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClanService {

  constructor(private http: HttpClient) { }

  getClanById(clanId: number): Observable<Clan> {
    return this.http.post<Clan>(`${environment.apiUrl}api/game/clan/by-id`, { clanId });
  }


}
