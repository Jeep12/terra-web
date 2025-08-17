import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { CoinPackage, PaymentMethod, PaymentRequest } from '../../../models/coin-package.model';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-buy-terra-coin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './buy-terra-coin.component.html',
  styleUrl: './buy-terra-coin.component.css'
})
export class BuyTerraCoinComponent implements OnInit, OnDestroy {
  // Estados del componente
  loading = false;
  packages: CoinPackage[] = [];
  paymentMethods: PaymentMethod[] = [];
  selectedPackage: CoinPackage | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  currentStep = 0;
  errorMessage = '';
  
  // Estados de loading específicos
  loadingPackages = false;
  loadingPaymentMethods = false;
  processingPayment = false;

  // Nuevo estado para mostrar información de preferencia
  preferenceData: any = null;
  showPreferenceInfo = false;

  private destroy$ = new Subject<void>();

  constructor(
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
    this.loadPaymentMethods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Cargar paquetes de monedas
  loadPackages(): void {
    // Prevenir peticiones múltiples
    if (this.loadingPackages) {
      console.log('Ya se están cargando paquetes, ignorando petición adicional');
      return;
    }

    this.loadingPackages = true;
    this.errorMessage = '';

    this.paymentService.getPackages()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingPackages = false)
      )
      .subscribe({
        next: (packages) => {
          this.packages = packages.filter(pkg => pkg.active);
          console.log(`Paquetes cargados: ${this.packages.length} activos`);
        },
        error: (error) => {
          console.error('Error loading packages:', error);
          this.errorMessage = 'Error al cargar los paquetes. Por favor, intenta nuevamente.';
          this.showMessage('Error al cargar los paquetes', 'error');
        }
      });
  }

  // Cargar métodos de pago
  loadPaymentMethods(): void {
    // Prevenir peticiones múltiples
    if (this.loadingPaymentMethods) {
      console.log('Ya se están cargando métodos de pago, ignorando petición adicional');
      return;
    }

    this.loadingPaymentMethods = true;

    this.paymentService.getPaymentMethods()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingPaymentMethods = false)
      )
      .subscribe({
        next: (methods) => {
          this.paymentMethods = methods;
          console.log(`Métodos de pago cargados: ${methods.length} disponibles`);
        },
        error: (error) => {
          console.error('Error loading payment methods:', error);
          this.showMessage('Error al cargar métodos de pago', 'error');
        }
      });
  }

  // Seleccionar paquete
  selectPackage(pkg: CoinPackage): void {
    this.selectedPackage = pkg;
    this.currentStep = 1;
  }

  // Seleccionar método de pago
  selectPaymentMethod(method: PaymentMethod): void {
    if (method.enabled) {
      this.selectedPaymentMethod = method;
    }
  }

  // Volver al paso anterior
  goBack(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      if (this.currentStep === 0) {
        this.selectedPackage = null;
      }
    }
  }

  // Cancelar proceso
  cancel(): void {
    this.selectedPackage = null;
    this.selectedPaymentMethod = null;
    this.currentStep = 0;
    this.errorMessage = '';
    this.showPreferenceInfo = false;
    this.preferenceData = null;
  }

  // Confirmar compra
  confirmPurchase(): void {
    if (!this.selectedPackage || !this.selectedPaymentMethod) {
      this.showMessage('Por favor selecciona un paquete y método de pago', 'warning');
      return;
    }

    // Prevenir peticiones múltiples
    if (this.processingPayment) {
      console.log('Ya se está procesando un pago, ignorando petición adicional');
      return;
    }

    this.processingPayment = true;
    this.errorMessage = '';

    const paymentRequest: PaymentRequest = {
      packageId: this.selectedPackage.id,
      paymentMethod: this.selectedPaymentMethod.id,
      amount: this.selectedPackage.price,
      totalCoins: this.selectedPackage.totalCoins
    };

    console.log('Procesando pago con packageId:', this.selectedPackage.id);
    console.log('Procesando pago:', paymentRequest);

    this.paymentService.processPayment(paymentRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.processingPayment = false)
      )
      .subscribe({
        next: (response) => {
          console.log('Respuesta del pago:', response);
          
          // Manejar diferentes estados de respuesta
          switch (response.status) {
            case 'approved':
              this.showMessage('Pago procesado correctamente', 'success');
              this.cancel();
              break;
            case 'pending':
              // Mostrar información de la preferencia
              if (response.preferenceData) {
                this.preferenceData = response.preferenceData;
                this.showPreferenceInfo = true;
                this.showMessage('Preferencia creada. Revisa los datos antes de continuar.', 'success');
              } else {
                this.showMessage('Pago en proceso...', 'success');
              }
              break;
            default:
              this.showMessage('Pago procesado', 'success');
              break;
          }
        },
        error: (error) => {
          console.error('Error processing payment:', error);
          
          // Manejar diferentes tipos de errores
          let errorMessage = 'Error al procesar el pago. Por favor, intenta nuevamente.';
          
          if (error.message && error.message.includes('URL de pago válida')) {
            errorMessage = 'Error de configuración del servidor. Contacta al soporte técnico.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 400) {
            errorMessage = 'Error en la configuración del pago. Verifica los datos e intenta nuevamente.';
          } else if (error.status === 500) {
            errorMessage = 'Error del servidor. Intenta más tarde.';
          }
          
          this.errorMessage = errorMessage;
          this.showMessage(errorMessage, 'error');
        }
      });
  }

  // Mostrar mensaje (reemplaza snackbar)
  private showMessage(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    // Crear un elemento de mensaje temporal
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-popup ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      ${type === 'error' ? 'background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);' : 
        type === 'warning' ? 'background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%);' : 
        'background: linear-gradient(135deg, #2ed573 0%, #1e90ff 100%);'}
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remover después de 4 segundos
    setTimeout(() => {
      messageDiv.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(messageDiv)) {
          document.body.removeChild(messageDiv);
        }
      }, 300);
    }, 4000);
  }

  // Calcular descuento
  getDiscountPercentage(pkg: CoinPackage): number {
    if (pkg.originalPrice && pkg.originalPrice > pkg.price) {
      return Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
    }
    return 0;
  }

  // Verificar si un método de pago está seleccionado
  isPaymentMethodSelected(method: PaymentMethod): boolean {
    return this.selectedPaymentMethod?.id === method.id;
  }

  // Verificar si se puede continuar al siguiente paso
  canContinue(): boolean {
    if (this.currentStep === 0) {
      return this.selectedPackage !== null;
    }
    if (this.currentStep === 1) {
      return this.selectedPaymentMethod !== null && this.selectedPaymentMethod.enabled;
    }
    return false;
  }

  // Continuar con el pago después de revisar la preferencia
  continueToPayment(): void {
    if (this.preferenceData && this.preferenceData.initPoint) {
      console.log('Redirigiendo a Mercado Pago con URL:', this.preferenceData.initPoint);
      window.open(this.preferenceData.initPoint, '_blank');
      this.showMessage('Redirigiendo a Mercado Pago...', 'success');
      this.cancel();
    } else if (this.preferenceData && this.preferenceData.paymentUrl) {
      console.log('Redirigiendo a Mercado Pago con paymentUrl:', this.preferenceData.paymentUrl);
      window.open(this.preferenceData.paymentUrl, '_blank');
      this.showMessage('Redirigiendo a Mercado Pago...', 'success');
      this.cancel();
    } else {
      this.showMessage('Error: No se encontró URL de pago válida', 'error');
    }
  }

  // Cancelar revisión de preferencia
  cancelPreferenceReview(): void {
    this.showPreferenceInfo = false;
    this.preferenceData = null;
    this.showMessage('Revisión cancelada', 'warning');
  }

  // Obtener información formateada de la preferencia
  getPreferenceInfo(): any {
    if (!this.preferenceData) return null;
    
    return {
      preferenceId: this.preferenceData.preferenceId || this.preferenceData.id,
      initPoint: this.preferenceData.initPoint || this.preferenceData.init_point || this.preferenceData.paymentUrl,
      sandboxInitPoint: this.preferenceData.sandboxInitPoint,
      publicKey: this.preferenceData.publicKey,
      status: this.preferenceData.status,
      message: this.preferenceData.message,
      // Datos adicionales que pueda tener la preferencia
      items: this.preferenceData.items,
      payer: this.preferenceData.payer,
      backUrls: this.preferenceData.back_urls,
      autoReturn: this.preferenceData.auto_return,
      notificationUrl: this.preferenceData.notification_url,
      // Configuraciones adicionales
      expires: this.preferenceData.expires,
      collectorId: this.preferenceData.collector_id,
      clientId: this.preferenceData.client_id,
      marketplace: this.preferenceData.marketplace,
      marketplaceFee: this.preferenceData.marketplace_fee,
      differentialPricing: this.preferenceData.differential_pricing,
      binaryMode: this.preferenceData.binary_mode,
      expiresFrom: this.preferenceData.expires_from,
      expiresTo: this.preferenceData.expires_to
    };
  }
}
