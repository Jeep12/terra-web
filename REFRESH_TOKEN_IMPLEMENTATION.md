# 🔄 Sistema de Refresh Tokens - Implementación Angular

## 📋 Arquitectura Implementada

El sistema de refresh tokens está completamente implementado en Angular siguiendo las mejores prácticas de seguridad:

### 🍪 Cookies y Tokens
- **Access Token**: 15 segundos (para testing)
- **Refresh Token**: 7 días
- **Cookies**: HttpOnly, Path=/, automáticas
- **Seguridad**: Los tokens nunca son accesibles por JavaScript

### 🔄 Flujo de Refresh Automático

1. **Request Normal** → 401 TOKEN_EXPIRED
2. **Interceptor Detecta** → POST /api/auth/refresh
3. **Backend Valida** → Genera nuevo access_token
4. **Backend Setea Cookie** → Automáticamente
5. **Interceptor Reintenta** → Request original → 200 OK

## 🛠️ Componentes Implementados

### 1. AuthInterceptor (`src/app/interceptors/auth.interceptor.ts`)

```typescript
// Maneja automáticamente:
- TOKEN_EXPIRED → Refresh automático
- 2FA_REQUIRED_UNTRUSTED_DEVICE → Redirige a 2FA
- REFRESH_TOKEN_EXPIRED → Logout automático
- Otros errores 401/403 → Refresh automático
```

**Características:**
- ✅ Evita bucles infinitos
- ✅ Maneja múltiples requests simultáneos
- ✅ Diferencia entre tipos de error
- ✅ Headers automáticos (X-Device-Id)
- ✅ withCredentials automático

### 2. AuthService (`src/app/services/auth.service.ts`)

```typescript
// Métodos principales:
- login() → Maneja cookies automáticamente
- refreshToken() → Refresh transparente
- getCurrentUser() → Cache inteligente
- logout() → Limpieza completa
```

**Características:**
- ✅ Cache de usuario para performance
- ✅ Manejo de errores específicos
- ✅ Logs detallados para debugging
- ✅ Estado de autenticación centralizado

## 🎯 Puntos Clave Implementados

### ✅ Lo que SÍ funciona:
1. **Cookies HttpOnly**: Máxima seguridad, no accesibles por JS
2. **Refresh automático**: Transparente para el usuario
3. **Headers automáticos**: X-Device-Id se envía automáticamente
4. **Manejo de errores**: Diferenciación entre tipos de error
5. **Evita bucles**: No hace refresh para errores 2FA

### ❌ Lo que NO hacer:
1. NO acceder a cookies manualmente desde JavaScript
2. NO hacer refresh para errores 2FA
3. NO reintentar requests que van a fallar de nuevo
4. NO enviar tokens en headers manuales

## 🔧 Configuración Angular

### 1. App Config (`src/app/app.config.ts`)
```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor])
)
```

### 2. Headers Requeridos
- ✅ `X-Device-Id`: Se genera automáticamente
- ✅ `User-Agent`: Se envía automáticamente
- ✅ `Cookies`: Se envían automáticamente con `withCredentials: true`

## 📡 Endpoints y Respuestas

### ✅ POST /api/auth/login:
```json
{
  "message": "Autenticación exitosa",
  "email": "user@email.com"
}
```
**Headers de respuesta:**
```
Set-Cookie: access_token=eyJ...; HttpOnly; Path=/; Max-Age=15
Set-Cookie: refresh_token=eyJ...; HttpOnly; Path=/; Max-Age=604800
```

### ✅ POST /api/auth/refresh:
```json
{
  "message": "Token renovado exitosamente",
  "email": "user@email.com"
}
```
**Headers de respuesta:**
```
Set-Cookie: access_token=eyJ...; HttpOnly; Path=/; Max-Age=15
```

### ❌ Error Token Expirado:
```json
{
  "message": "El token expiró",
  "error": "Sesión caducada",
  "code": "TOKEN_EXPIRED"
}
```

### ❌ Error 2FA Requerido:
```json
{
  "message": "Autenticación 2FA requerida",
  "error": "Dispositivo no confiable",
  "code": "2FA_REQUIRED_UNTRUSTED_DEVICE"
}
```

## 🔄 Flujo Completo de 2FA

1. **Usuario hace login** → Token con `twoFactorPassed = false`
2. **Frontend hace /api/auth/me** → 401 `2FA_REQUIRED_UNTRUSTED_DEVICE`
3. **Frontend detecta error** → Redirige a `/two-factor-step`
4. **Usuario ingresa código 2FA** → POST `/api/auth/verify-2fa-code`
5. **Backend valida código** → Actualiza `twoFactorPassed = true`
6. **Frontend retry /api/auth/me** → 200 OK

## 📊 Logs Esperados

### ✅ Login exitoso:
```
✅ [LOGIN SUCCESS] Usuario autenticado: user@email.com
📥 [TOKEN GUARDADO] Token persistido para el usuario: user@email.com
🔄 [REFRESH TOKEN] Refresh token generado
🍪 [COOKIE SET] Cookie enviada con el token
```

### ✅ Refresh exitoso:
```
🔄 [REFRESH SUCCESS] Token renovado para: user@email.com
```

### ❌ 2FA requerido:
```
❌ [JWT ERROR] 2FA_REQUIRED_UNTRUSTED_DEVICE - Dispositivo no confiable
```

## 🚀 Endpoints Públicos (NO requieren autenticación)

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/resend-reset-email`
- `/api/auth/reset-password`
- `/api/auth/verify-email`
- `/api/auth/resend-verification`
- `/api/auth/google/login`
- `/api/auth/refresh`
- `/api/kick/channels/**`
- `/api/game/ranking/top-pvp`
- `/api/game/ranking/top-pk`

## 🎯 Problema del Bucle Infinito (SOLUCIONADO)

**Problema anterior:**
1. `/api/auth/me` → 401 `2FA_REQUIRED_UNTRUSTED_DEVICE`
2. Interceptor hace refresh → Nuevo token con 2FA no pasado
3. Reintenta `/api/auth/me` → Mismo error, bucle infinito

**Solución implementada:**
- ✅ Solo hacer refresh para `TOKEN_EXPIRED`
- ✅ Para errores 2FA, redirigir a pantalla 2FA inmediatamente
- ✅ NO reintentar requests que van a fallar

## 🔧 Uso del Sistema

### Para Desarrolladores:
1. **Todas las requests** automáticamente tienen `withCredentials: true`
2. **No necesitas** manejar tokens manualmente
3. **El refresh** es completamente transparente
4. **Los errores** se manejan automáticamente

### Para Testing:
1. **Access Token**: 15 segundos (para testing rápido)
2. **Refresh Token**: 7 días (para sesiones largas)
3. **Cookies**: HttpOnly (máxima seguridad)

¡El sistema está completamente implementado y listo para usar! 🚀 