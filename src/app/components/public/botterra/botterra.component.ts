import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatbotService } from '../../../services/chatbot.service';

interface ChatMessage {
  text: string | SafeHtml;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Component({
  selector: 'app-botterra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './botterra.component.html',
  styleUrl: './botterra.component.css'
})
export class BotterraComponent {
  msg = "";
  messages: ChatMessage[] = [];
  isLoading = false;

  private chatbotService = inject(ChatbotService);
  private cdRef = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  async sendMessage() {
    const messageText = this.msg.trim();
    if (!messageText || this.isLoading) return;

    this.addMessage(messageText, 'user');
    this.msg = "";
    this.isLoading = true;

    try {
      const response = await this.chatbotService.sendMessageAsync(messageText);
      const botResponse = this.extractBotResponse(response);
      this.addMessage(botResponse, 'bot');
      console.log('Respuesta del bot:', botResponse);
      console.log('Respuesta completa:', response);
    } catch (error) {
      this.addMessage("Error al conectar con el servicio", 'bot');
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
      this.forceViewUpdate();
      this.scrollToBottom();
    }
  }

  private addMessage(text: string, sender: 'user' | 'bot') {
    const safeText = sender === 'bot'
      ? this.sanitizer.bypassSecurityTrustHtml(text.replace(/\n/g, '<br>'))
      : text;

    this.messages = [
      ...this.messages,
      {
        text: safeText,
        sender,
        timestamp: new Date()
      }
    ];
    this.cdRef.detectChanges();
  }

  private extractBotResponse(response: any): string {
    // Más opciones para extraer la respuesta del webhook
    return response?.output ||
      response?.reply ||
      response?.message ||
      response?.data?.message ||
      response?.result ||
      JSON.stringify(response) || // Si no hay formato específico, mostrar todo
      "Recibí tu mensaje";
  }

  private forceViewUpdate() {
    this.cdRef.detectChanges();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}