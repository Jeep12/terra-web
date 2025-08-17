export interface CoinPackage {
  id: number;
  name: string;
  coinsAmount: number;
  bonusCoins: number;
  price: number;
  originalPrice?: number;
  bonusPercentage: number;
  description: string;
  popular: boolean;
  active: boolean;
  sortOrder: number;
  totalCoins: number; // Calculado: coinsAmount + bonusCoins
  discountAmount?: number; // Calculado si hay originalPrice
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  comingSoon?: boolean;
  description?: string;
}

export interface PaymentRequest {
  packageId: number;
  paymentMethod: string;
  amount: number;
  totalCoins: number;
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'approved' | 'cancelled';
  paymentUrl?: string | null;
  message?: string;
  preferenceData?: any; // Datos completos de la preferencia de Mercado Pago
}
