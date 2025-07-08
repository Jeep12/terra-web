import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface KickChannel {
  id: number;
  username: string;
  slug: string;
  is_live: boolean;
  livestream?: {
    id: number;
    title: string;
    thumbnail: string;
    viewer_count: number;
    started_at: string;
  };
}
@Injectable({
  providedIn: 'root'
})


export class StreamingService {

  constructor(private http: HttpClient) { }



  getKickChannel(slug: string): Observable<KickChannel> {
    return this.http.get<KickChannel>(`${environment.apiUrl}api/kick/channels/${slug}`);
  }
}
