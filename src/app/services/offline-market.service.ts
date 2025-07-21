import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { OfflineStoreDTO } from '../models/offline-store.model';

@Injectable({
  providedIn: 'root'
})
export class OfflineMarketService {

  constructor(private http: HttpClient) { }

  getOfflineStores(): Observable<OfflineStoreDTO> {
    return this.http.get<OfflineStoreDTO>(`${environment.apiUrl}api/game/offline-market`);
  }

  getTest(): Observable<OfflineStoreDTO> {
    return this.http.post<OfflineStoreDTO>(`${environment.apiUrl}api/game/offline-market`, {});
  }


}
