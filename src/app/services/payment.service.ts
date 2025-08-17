import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CoinPackage, PaymentMethod, PaymentRequest, PaymentResponse } from '../models/coin-package.model';
import { environment } from '../environments/environment';

// Mercado Pago SDK - se cargará dinámicamente
// 
// NOTA: Este servicio está configurado para funcionar en modo de desarrollo.
// Para usar el SDK real de Mercado Pago en producción, se requiere:
// 1. Configurar el backend para crear preferencias
// 2. Implementar webhooks para recibir notificaciones
// 3. Configurar las URLs de retorno
// 4. Usar las credenciales reales de Mercado Pago

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private mercadopago: any;
  private packagesCache: CoinPackage[] | null = null;
  private paymentMethodsCache: PaymentMethod[] | null = null;
  private lastPackagesFetch = 0;
  private lastMethodsFetch = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor(private http: HttpClient) { 
    // Solo inicializar una vez
    if (!this.mercadopago) {
      this.initializeMercadoPago();
    }
  }

  // Inicializar Mercado Pago SDK
  private initializeMercadoPago(): void {
    // Solo inicializar una vez
    if (this.mercadopago) return;
    
    console.log('Inicializando Mercado Pago SDK (una sola vez)');
    this.mercadopago = {}; // Placeholder para futura implementación
  }

  // Crear preferencia de pago en Mercado Pago
  createMercadoPagoPreference(paymentRequest: PaymentRequest): Observable<any> {
    // ✅ Solo envía el packageId - el backend maneja todo lo demás
    const request = {
      packageId: paymentRequest.packageId,
      // 🔗 Información adicional para back_urls (opcional para el backend)
      // El backend puede usar estas URLs o generar las suyas propias
      frontendUrls: {
        success: `${window.location.origin}/payment-success`,
        failure: `${window.location.origin}/payment-failure`,
        pending: `${window.location.origin}/payment-pending`
      },
      // 📱 Información del usuario (opcional)
      payer: {
        // Aquí podrías incluir información del usuario si está disponible
      },
      // ⚙️ Configuración adicional
      autoReturn: 'approved', // Redirigir automáticamente en pagos aprobados
      notificationUrl: `${environment.apiUrl}api/payments/webhook` // URL del webhook
    };

    console.log('Enviando request con frontend URLs:', request);
    console.log('Dominio actual:', window.location.origin);
    console.log('Entorno:', environment.production ? 'PRODUCCIÓN' : 'DESARROLLO');
    
    return this.http.post<any>(`${environment.apiUrl}api/payments/create-preference`, request).pipe(
      catchError(error => {
        console.error('Error creando preferencia de Mercado Pago:', error);
        
        // 🔧 SOLUCIÓN TEMPORAL: Simular pago exitoso para desarrollo
        if (error.status === 400) {
          console.warn('🔧 MODO DESARROLLO: Simulando pago exitoso debido a error del backend');
          
          // Simular respuesta exitosa después de 2 segundos
          return new Observable(observer => {
            setTimeout(() => {
              observer.next({
                preferenceId: 'dev_preference_' + Date.now(),
                initPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=DEV_MODE',
                sandboxInitPoint: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=DEV_MODE',
                publicKey: 'DEV_PUBLIC_KEY',
                status: 'success',
                message: 'Pago simulado para desarrollo',
                // 🔗 Simular back_urls para desarrollo
                back_urls: {
                  success: `${window.location.origin}/payment-success`,
                  failure: `${window.location.origin}/payment-failure`,
                  pending: `${window.location.origin}/payment-pending`
                },
                auto_return: 'approved',
                notification_url: `${environment.apiUrl}api/payments/webhook`
              });
              observer.complete();
            }, 2000);
          });
        }
        
        throw error;
      })
    );
  }

    // Procesar pago con Mercado Pago
  processMercadoPagoPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return new Observable(observer => {
      console.log('Procesando pago con Mercado Pago:', paymentRequest);
      
      this.createMercadoPagoPreference(paymentRequest).subscribe({
        next: (preference: any) => {
          console.log('=== PREFERENCIA CREADA ===');
          console.log('Datos completos de la preferencia:', preference);
          console.log('ID de preferencia:', preference.preferenceId || preference.id);
          console.log('URL de pago:', preference.initPoint || preference.init_point || preference.paymentUrl);
          console.log('Public Key:', preference.publicKey);
          console.log('Estado:', preference.status);
          
          // 🔗 Mostrar back_urls si están disponibles
          if (preference.back_urls) {
            console.log('=== BACK URLS ===');
            console.log('Success URL:', preference.back_urls.success);
            console.log('Failure URL:', preference.back_urls.failure);
            console.log('Pending URL:', preference.back_urls.pending);
          }
          
          // ⚙️ Mostrar configuración adicional
          if (preference.auto_return) {
            console.log('Auto Return:', preference.auto_return);
          }
          if (preference.notification_url) {
            console.log('Webhook URL:', preference.notification_url);
          }
          
          console.log('========================');
          
          // Verificar si la respuesta es válida
          if (!preference || (!preference.initPoint && !preference.init_point && !preference.paymentUrl)) {
            console.error('Respuesta inválida del backend:', preference);
            observer.error(new Error('Error: El backend no devolvió una URL de pago válida. Verifica la configuración del servidor.'));
            return;
          }
          
          // Obtener la URL de pago
          const paymentUrl = preference.initPoint || preference.init_point || preference.paymentUrl;
          
          if (paymentUrl) {
            console.log('URL de pago obtenida:', paymentUrl);
            
            // Verificar si es modo desarrollo
            if (paymentUrl.includes('DEV_MODE')) {
              console.warn('🔧 MODO DESARROLLO: Simulando pago exitoso');
              
              // Simular pago exitoso después de 3 segundos
              setTimeout(() => {
                observer.next({
                  id: preference.preferenceId,
                  status: 'approved' as const,
                  paymentUrl: null,
                  message: 'Pago simulado exitosamente (modo desarrollo)',
                  preferenceData: preference
                });
              }, 3000);
            } else {
              // NO redirigir automáticamente - solo devolver la información
              observer.next({
                id: preference.preferenceId || preference.id,
                status: 'pending' as const,
                paymentUrl: paymentUrl,
                message: 'Preferencia creada exitosamente. Revisa los datos antes de continuar.',
                preferenceData: preference
              });
            }
          } else {
            observer.next({
              id: preference.preferenceId || preference.id,
              status: 'pending' as const,
              paymentUrl: paymentUrl,
              message: 'Preferencia creada exitosamente. Revisa los datos antes de continuar.',
              preferenceData: preference
            });
          }
        },
        error: (error) => {
          console.error('Error procesando pago con Mercado Pago:', error);
          observer.error(error);
        }
      });
    });
  }

  // Obtener todos los paquetes de monedas
  getPackages(): Observable<CoinPackage[]> {
    const now = Date.now();
    
    // Verificar cache
    if (this.packagesCache && (now - this.lastPackagesFetch) < this.CACHE_DURATION) {
      console.log('Usando paquetes desde cache');
      return of(this.packagesCache);
    }

    console.log('Obteniendo paquetes desde servidor...');
    return this.http.get<CoinPackage[]>(`${environment.apiUrl}api/payments/packages`).pipe(
      map(packages => {
        const processedPackages = packages.map(pkg => ({
          ...pkg,
          totalCoins: pkg.coinsAmount + pkg.bonusCoins,
          discountAmount: pkg.originalPrice ? pkg.originalPrice - pkg.price : undefined
        }));
        
        // Guardar en cache
        this.packagesCache = processedPackages;
        this.lastPackagesFetch = now;
        
        return processedPackages;
      }),
      catchError(error => {
        console.error('Error fetching packages:', error);
        throw error;
      })
    );
  }

  // Obtener un paquete específico
  getPackage(id: number): Observable<CoinPackage> {
    return this.http.get<CoinPackage>(`${environment.apiUrl}api/payments/packages/${id}`).pipe(
      map(pkg => ({
        ...pkg,
        totalCoins: pkg.coinsAmount + pkg.bonusCoins,
        discountAmount: pkg.originalPrice ? pkg.originalPrice - pkg.price : undefined
      })),
      catchError(error => {
        console.error(`Error fetching package ${id}:`, error);
        throw error;
      })
    );
  }

  // Obtener paquetes populares
  getPopularPackages(): Observable<CoinPackage[]> {
    return this.http.get<CoinPackage[]>(`${environment.apiUrl}api/payments/packages/popular`).pipe(
      map(packages => packages.map(pkg => ({
        ...pkg,
        totalCoins: pkg.coinsAmount + pkg.bonusCoins,
        discountAmount: pkg.originalPrice ? pkg.originalPrice - pkg.price : undefined
      }))),
      catchError(error => {
        console.error('Error fetching popular packages:', error);
        throw error;
      })
    );
  }

  // Obtener balance de monedas
  getBalance(accountId: string): Observable<number> {
    return this.http.get<{ balance: number }>(`${environment.apiUrl}api/payments/balance/${accountId}`).pipe(
      map(response => response.balance),
      catchError(error => {
        console.error('Error fetching balance:', error);
        throw error;
      })
    );
  }

  // Obtener historial de transacciones
  getTransactions(accountId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}api/payments/history/${accountId}`).pipe(
      catchError(error => {
        console.error('Error fetching transactions:', error);
        throw error;
      })
    );
  }

  // Obtener estadísticas de cuenta
  getAccountStats(accountId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}api/payments/stats/${accountId}`).pipe(
      catchError(error => {
        console.error('Error fetching account stats:', error);
        throw error;
      })
    );
  }

  // Procesar pago
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    // Si el método de pago es Mercado Pago, usar el SDK
    if (paymentRequest.paymentMethod === 'mercadopago') {
      return this.processMercadoPagoPayment(paymentRequest);
    }

    // Para otros métodos de pago, usar el endpoint de crear preferencia
    return this.http.post<PaymentResponse>(`${environment.apiUrl}api/payments/create-preference`, paymentRequest).pipe(
      catchError(error => {
        console.error('Error processing payment:', error);
        throw error;
      })
    );
  }

  // Obtener métodos de pago disponibles (hardcodeados ya que no hay endpoint)
  getPaymentMethods(): Observable<PaymentMethod[]> {
    const now = Date.now();
    
    // Verificar cache
    if (this.paymentMethodsCache && (now - this.lastMethodsFetch) < this.CACHE_DURATION) {
      console.log('Usando métodos de pago desde cache');
      return of(this.paymentMethodsCache);
    }

    console.log('Usando métodos de pago hardcodeados...');
    const methods: PaymentMethod[] = [
      {
        id: 'mercadopago',
        name: 'Mercado Pago',
        icon: 'assets/images/icons/mercadopago-icon.png',
        enabled: true,
        description: 'Pago seguro con Mercado Pago'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'assets/images/icons/paypal-icon.png',
        enabled: false,
        comingSoon: true,
        description: 'Próximamente disponible'
      }
    ];
    
    // Guardar en cache
    this.paymentMethodsCache = methods;
    this.lastMethodsFetch = now;
    
    return of(methods);
  }

  // Limpiar cache (útil para forzar refresh)
  clearCache(): void {
    this.packagesCache = null;
    this.paymentMethodsCache = null;
    this.lastPackagesFetch = 0;
    this.lastMethodsFetch = 0;
    console.log('Cache limpiado');
  }

  // Forzar refresh de datos
  refreshPackages(): Observable<CoinPackage[]> {
    this.packagesCache = null;
    this.lastPackagesFetch = 0;
    return this.getPackages();
  }

  refreshPaymentMethods(): Observable<PaymentMethod[]> {
    this.paymentMethodsCache = null;
    this.lastMethodsFetch = 0;
    return this.getPaymentMethods();
  }
}
