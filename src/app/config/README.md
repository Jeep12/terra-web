# 🔧 Configuración de Endpoints - Sistema Optimizado
asd
## 📋 Descripción

Este sistema optimizado reemplaza el enfoque anterior de listas hardcodeadas de endpoints en el interceptor HTTP con un sistema basado en configuración centralizada y patrones.

## 🎯 Ventajas del Nuevo Sistema

### ✅ **Escalabilidad**
- Agregar nuevos endpoints públicos es tan simple como modificar un archivo de configuración
- No necesitas tocar el interceptor cada vez que agregas un endpoint

### ✅ **Mantenibilidad**
- Toda la configuración está centralizada en `endpoint-config.ts`
- Código más limpio y fácil de entender

### ✅ **Flexibilidad**
- Sistema basado en patrones que puede manejar endpoints dinámicos
- Fácil extensión para nuevos tipos de endpoints

### ✅ **Type Safety**
- Tipos TypeScript para mejor detección de errores
- Configuración readonly para prevenir modificaciones accidentales

## 🚀 Cómo Usar

### 1. **Agregar un Nuevo Endpoint Público**

```typescript
// En src/app/config/endpoint-config.ts
export const ENDPOINT_CONFIG = {
  PUBLIC: [
    '/api/auth/login',
    '/api/auth/register',
    // ... otros endpoints
    '/api/nuevo-endpoint-publico', // ← Agregar aquí
  ] as const,
  // ...
}
```

### 2. **Agregar un Nuevo Dominio Externo**

```typescript
export const ENDPOINT_CONFIG = {
  EXTERNAL_DOMAINS: [
    'n8n.l2terra.online',
    'nuevo-dominio.com', // ← Agregar aquí
  ] as const,
  // ...
}
```

### 3. **Agregar un Nuevo Patrón Público**

```typescript
export const ENDPOINT_CONFIG = {
  PUBLIC_PATTERNS: [
    '/api/public/',
    '/api/health',
    '/api/docs',
    '/api/webhooks/', // ← Agregar aquí
  ] as const,
  // ...
}
```

### 4. **Agregar un Nuevo Código de Error No Refreshable**

```typescript
export const ENDPOINT_CONFIG = {
  NON_REFRESHABLE_ERRORS: [
    'LOGIN_FAILED',
    'EMAIL_NOT_VERIFIED',
    // ... otros errores
    'NUEVO_ERROR_CODE', // ← Agregar aquí
  ] as const,
  // ...
}
```

## 🔍 Tipos de Endpoints

### **PUBLIC**
- No requieren autenticación
- Ejemplos: login, register, health checks
- **Comportamiento**: NO se intenta refresh automático

### **SPECIAL**
- Requieren manejo especial
- Ejemplos: refresh token, 2FA, verificación de auth
- **Comportamiento**: NO se intenta refresh automático

### **PROTECTED**
- Requieren autenticación
- Ejemplos: dashboard, perfil de usuario, datos privados
- **Comportamiento**: SÍ se intenta refresh automático si el token expira

## 🛠️ Funciones de Utilidad

### `addPublicEndpoint(endpoint: string)`
```typescript
import { addPublicEndpoint } from './config/endpoint-config';

// Agregar endpoint público dinámicamente
addPublicEndpoint('/api/nuevo-endpoint');
```

### `addExternalDomain(domain: string)`
```typescript
import { addExternalDomain } from './config/endpoint-config';

// Agregar dominio externo dinámicamente
addExternalDomain('nuevo-dominio.com');
```

### `addNonRefreshableError(errorCode: string)`
```typescript
import { addNonRefreshableError } from './config/endpoint-config';

// Agregar código de error no refreshable dinámicamente
addNonRefreshableError('NUEVO_ERROR_CODE');
```

## 📊 Comparación: Antes vs Después

### ❌ **Antes (No Escalable)**
```typescript
// En el interceptor - difícil de mantener
const isPublicEndpoint = req.url.includes('/api/auth/login') || 
                        req.url.includes('/api/auth/register') ||
                        req.url.includes('/api/auth/resend-reset-email') ||
                        // ... 10+ líneas más
                        req.url.includes('/api/game/ranking/top-pk');
```

### ✅ **Después (Escalable)**
```typescript
// En configuración separada - fácil de mantener
export const ENDPOINT_CONFIG = {
  PUBLIC: [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/resend-reset-email',
    // ... fácil de agregar más
  ] as const,
}

// En el interceptor - limpio y simple
const endpointType = getEndpointType(req.url);
```

## 🔄 Migración

Si tienes endpoints existentes que no están en la configuración:

1. **Identifica** el tipo de endpoint (PUBLIC, SPECIAL, PROTECTED)
2. **Agrega** el endpoint a la configuración correspondiente
3. **Prueba** que funciona correctamente
4. **Documenta** cualquier comportamiento especial

## 🎯 Mejores Prácticas

1. **Usa patrones** cuando sea posible (ej: `/api/public/`)
2. **Agrupa endpoints relacionados** en la misma categoría
3. **Documenta** endpoints especiales con comentarios
4. **Prueba** nuevos endpoints antes de agregarlos a producción
5. **Mantén la configuración actualizada** cuando agregues nuevos endpoints

## 🚨 Consideraciones

- Los arrays son `readonly` para prevenir modificaciones accidentales
- Usa `as const` para mejor inferencia de tipos
- Las funciones de utilidad son para desarrollo/debugging
- En producción, considera usar una API para configuración dinámica
