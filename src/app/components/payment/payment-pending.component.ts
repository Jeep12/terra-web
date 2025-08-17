import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-result-container">
      <div class="payment-result pending">
        <div class="result-icon">⏳</div>
        <h2>Pago Pendiente</h2>
        <p>Tu pago está siendo procesado. Esto puede tomar unos minutos.</p>
        <p class="pending-info">Recibirás una notificación cuando el pago sea confirmado.</p>
        <div class="actions">
          <button routerLink="/dashboard" class="btn-primary">
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-result-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 2rem;
    }

    .payment-result {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .result-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    h2 {
      color: #ffa502;
      font-size: 2rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    p {
      color: #b8b8b8;
      font-size: 1.1rem;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .pending-info {
      color: #ffa502;
      font-weight: 600;
    }

    .actions {
      margin-top: 2rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 165, 2, 0.4);
    }

    @media (max-width: 768px) {
      .payment-result {
        padding: 2rem;
        margin: 1rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      p {
        font-size: 1rem;
      }
    }
  `]
})
export class PaymentPendingComponent {}
