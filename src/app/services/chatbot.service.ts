import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly WEBHOOK_URL = environment.WEBHOOK_URL_N8N;
  private readonly AUTH_USERNAME = environment.AUTH_USERNAME_N8N;
  private readonly AUTH_PASSWORD = environment.AUTH_PASSWORD_N8N;

  constructor(private http: HttpClient) { }

  // Opción 1: Método async/await
  async sendMessageAsync(message: string): Promise<any> {
    const body = {
      sessionId: "asdasdsa",
      message: message,
      timestamp: new Date().toISOString(),
      action: 'sendMessage'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${this.AUTH_USERNAME}:${this.AUTH_PASSWORD}`)
    });

    try {
      const response = await lastValueFrom(
        this.http.post(this.WEBHOOK_URL, body, { headers, withCredentials: false }) // ✅ Cambié a false
      );
      return response;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  // Opción 2: Método Observable (recomendado)
  sendMessage(message: string): Observable<any> {
    const body = {
      sessionId: "asdasdsa",
      message: message,
      timestamp: new Date().toISOString(),
      action: 'sendMessage'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${this.AUTH_USERNAME}:${this.AUTH_PASSWORD}`)
    });

    return this.http.post(this.WEBHOOK_URL, body, { headers, withCredentials: false });
  }
}