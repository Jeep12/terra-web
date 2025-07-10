import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
export class BotterraComponent implements AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  msg = "";
  messages: ChatMessage[] = [];
  isLoading = false;
  private shouldScrollToBottom = false;

  private chatbotService = inject(ChatbotService);
  private cdRef = inject(ChangeDetectorRef);
  private sanitizer = inject(DomSanitizer);

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  async sendMessage() {
    const messageText = this.msg.trim();
    if (!messageText || this.isLoading) return;

    this.addMessage(messageText, 'user');
    this.msg = "";
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    // Focus back to input after sending
    setTimeout(() => {
      this.messageInput?.nativeElement?.focus();
    }, 100);

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
      this.shouldScrollToBottom = true;
      this.forceViewUpdate();
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
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
    this.shouldScrollToBottom = true;
    this.cdRef.detectChanges();
  }

  private extractBotResponse(response: any): string {
    return response?.output ||
      response?.reply ||
      response?.message ||
      response?.data?.message ||
      response?.result ||
      JSON.stringify(response) ||
      "Recibí tu mensaje";
  }

  private forceViewUpdate() {
    this.cdRef.detectChanges();
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }

  trackByMessage(index: number, message: ChatMessage): number {
    return index;
  }
}