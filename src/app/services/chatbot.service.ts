import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly WEBHOOK_URL = 'https://n8n.l2terra.online/webhook/48cb067e-63a7-42be-b22e-a015e1e8cded';
  private readonly AUTH_USERNAME = 'ak4n1';
  private readonly AUTH_PASSWORD = '1234567890';

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