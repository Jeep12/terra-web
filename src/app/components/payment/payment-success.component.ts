import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="payment-result-container">
      <div class="payment-result success">
        <div class="result-icon">✅</div>
        <h2>¡Pago Exitoso!</h2>
        <p>Tu compra de Terra Coins ha sido procesada correctamente.</p>
        <p class="coins-info">Los coins serán acreditados en tu cuenta en breve.</p>
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
    }

    h2 {
      color: #2ed573;
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

    .coins-info {
      color: #dabe64;
      font-weight: 600;
    }

    .actions {
      margin-top: 2rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #dabe64 0%, #ffd700 100%);
      color: #1a1a2e;
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
      box-shadow: 0 8px 25px rgba(218, 190, 100, 0.4);
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
export class PaymentSuccessComponent {}
