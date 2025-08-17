/**
 * Configuración de endpoints para el interceptor HTTP
 * 
 * Este archivo centraliza toda la configuración de endpoints para facilitar
 * el mantenimiento y la escalabilidad del sistema de autenticación.
 * 
 * 🚀 CÓMO AGREGAR NUEVOS ENDPOINTS:
 * 
 * 1. Para endpoints públicos (no requieren auth):
 *    - Agregar a la lista PUBLIC
 * 
 * 2. Para endpoints con manejo especial (2FA, refresh, etc.):
 *    - Agregar a la lista SPECIAL_HANDLING
 * 
 * 3. Para patrones de URLs públicas:
 *    - Agregar a la lista PUBLIC_PATTERNS
 * 
 * 4. Para dominios externos:
 *    - Agregar a la lista EXTERNAL_DOMAINS
 * 
 * 5. Para códigos de error que no deben hacer refresh:
 *    - Agregar a la lista NON_REFRESHABLE_ERRORS
 */

export const ENDPOINT_CONFIG = {
  // Endpoints que NO requieren autenticación (públicos)
  PUBLIC: [
    '/api/auth/login',
    '/api/auth/register', 
    '/api/auth/resend-reset-email',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/google/login',
    '/api/auth/request-2fa-code',
    '/api/auth/verify-2fa-code',
    '/api/kick/channels',
    '/api/game/ranking/top-pvp',
    '/api/game/ranking/top-pk',
    '/api/payments/packages',
    '/api/payments/packages/',
    '/api/payments/create-preference',
    '/api/payments/balance/',
    '/api/payments/history/',
    '/api/payments/stats/',
    '/api/payments/webhook',
    '/api/payments/webhook/test',
    '/api/payments/webhook/health',
    // 🆕 EJEMPLO: Agregar nuevo endpoint público
    // '/api/nuevo-endpoint-publico',
  ] as const,
  
  // Endpoints que requieren manejo especial (NO hacer refresh automático)
  SPECIAL_HANDLING: [
    '/api/auth/refresh',      // Endpoint de refresh (ya falló)
    '/api/auth/me',           // Endpoint de verificación de auth
    '/api/auth/request-2fa-code',  // 2FA
    '/api/auth/verify-2fa-code',   // 2FA
    // 🆕 EJEMPLO: Agregar endpoint con manejo especial
    // '/api/auth/logout',     // Logout (manejo especial)
  ] as const,
  
  // Patrones de URLs que indican endpoints públicos
  PUBLIC_PATTERNS: [
    '/api/public/',
    '/api/health',
    '/api/docs',
    // 🆕 EJEMPLO: Agregar patrón para webhooks
    // '/api/webhooks/',
  ] as const,
  
  // Dominios externos que no requieren autenticación
  EXTERNAL_DOMAINS: [
    'n8n.l2terra.online',
    // 🆕 EJEMPLO: Agregar nuevo dominio externo
    // 'api.external-service.com',
  ] as const,
  
  // Códigos de error que NO deben intentar refresh automático
  NON_REFRESHABLE_ERRORS: [
    'LOGIN_FAILED',
    'EMAIL_NOT_VERIFIED', 
    'USER_DISABLED',
    'TWO_FACTOR_NOT_PASSED',
    'REFRESH_TOKEN_EXPIRED',
    'REFRESH_TOKEN_MISSING',
    // 🆕 EJEMPLO: Agregar nuevo código de error
    // 'ACCOUNT_LOCKED',
  ] as const
} as const;

// Tipos TypeScript para mejor tipado
export type EndpointType = 'PUBLIC' | 'SPECIAL' | 'PROTECTED';
export type ErrorCode = typeof ENDPOINT_CONFIG.NON_REFRESHABLE_ERRORS[number];

// Función para agregar nuevos endpoints públicos fácilmente
export function addPublicEndpoint(endpoint: string): void {
  // En un entorno de producción, esto podría guardarse en localStorage o en una API
  console.log(`[CONFIG] Agregando endpoint público: ${endpoint}`);
}

// Función para agregar nuevos dominios externos
export function addExternalDomain(domain: string): void {
  console.log(`[CONFIG] Agregando dominio externo: ${domain}`);
}

// Función para agregar nuevos códigos de error no refreshables
export function addNonRefreshableError(errorCode: string): void {
  console.log(`[CONFIG] Agregando código de error no refreshable: ${errorCode}`);
}
