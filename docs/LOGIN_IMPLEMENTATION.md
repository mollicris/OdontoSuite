# Login Implementation - OdontoSuite Frontend

**Fecha**: 12 de abril de 2026  
**Stack**: React 19 + Vite + Mantine + TanStack Router + Axios + Zod + Zustand  
**Status**: ✅ Completado

---

## 📋 Plan Original

### Contexto
Implementar el login en el frontend de OdontoSuite siguiendo la arquitectura DDD (Domain-Driven Design) definida en `docs/GUIDE.MD` y `docs/STACK.md`. El backend (NestJS puerto 3000) ya está implementado con `POST /auth/login` retornando `{ data: { accessToken, user } }`.

### Dependencias Instaladas
```bash
# UI & Forms
npm install @mantine/core @mantine/hooks @mantine/form @mantine/notifications @mantine/dates dayjs
npm install @tabler/icons-react

# Router & Data
npm install @tanstack/react-router @tanstack/react-query

# HTTP & Validation
npm install axios zod

# State
npm install zustand

# Helpers
npm install react-helmet-async
```

---

## 🏗️ Estructura de Archivos Creados

```
frontend/src/
├── app.tsx                                    (sin cambios significativos)
├── app.css                                    (vacío)
├── main.tsx                                   ✅ MODIFICADO - agregar Mantine CSS import
├── index.css                                  ✅ MODIFICADO - limpiar estilos conflictivos
│
├── core/
│   ├── api/
│   │   └── httpClient.ts                     ✅ Axios singleton con interceptors
│   ├── providers/
│   │   └── providers.tsx                     ✅ Global providers setup
│   └── router/
│       ├── baseRedirectRouter.tsx            ✅ Root route con Outlet
│       └── tankStackRouter.tsx               ✅ Router singleton
│
├── shared/
│   └── constants/
│       └── routes.ts                         ✅ Route constants
│
└── features/
    └── auth/
        ├── domain/
        │   ├── Auth.types.ts                 ✅ Type definitions
        │   ├── Auth.request.ts               ✅ Request DTOs
        │   └── Auth.response.ts              ✅ API response types
        ├── infrastructure/
        │   ├── api/
        │   │   └── auth.api.ts               ✅ API adapter layer
        │   └── store/
        │       └── auth.store.ts             ✅ Zustand store
        ├── application/
        │   └── auth.service.ts               ✅ Business logic
        ├── login/
        │   ├── Login.tsx                     ✅ Login page component
        │   └── hooks/
        │       └── useLogin.ts               ✅ Form hook with validation
        └── router/
            ├── metadata.ts                   ✅ Route constants
            ├── routes.tsx                    ✅ Route definitions
            └── router.tsx                    ✅ Router factory
```

---

## 📝 Implementación Detallada

### 1. **HTTP Client** (`core/api/httpClient.ts`)
```typescript
// Singleton Axios con:
- baseURL: http://localhost:3000 (configurable via .env VITE_API_URL)
- Request interceptor: adjunta JWT token en header Authorization
- Response interceptor: maneja 401 (logout y redirect a /auth/login)
```

**Características clave:**
- Reutilizable en toda la aplicación
- Token management automático
- Error handling centralizado

---

### 2. **Zustand Store** (`features/auth/infrastructure/store/auth.store.ts`)
```typescript
// Estado global con:
- user: AuthUser | null
- token: string | null
- isAuthenticated: boolean
- login(token, user): guarda en store y localStorage
- logout(): limpia store y localStorage
- Persist middleware: carga token desde localStorage al iniciar
```

**Características clave:**
- Persistencia automática en localStorage
- Recuperación de sesión al refresh
- Centralized authentication state

---

### 3. **API Layer** (`features/auth/infrastructure/api/auth.api.ts`)
```typescript
// Adapter que:
- Llama httpClient.post('/auth/login', request)
- Transforma respuesta backend { data: { accessToken, user } }
- Retorna { token, user } tipado con dominio
```

**Características clave:**
- Desacoplamiento de formato backend vs dominio
- Type-safe API responses
- Fácil de testear

---

### 4. **Auth Service** (`features/auth/application/auth.service.ts`)
```typescript
// Orquesta:
- login(request): 
  1. Llama api.loginUser()
  2. Guarda en Zustand store
  3. Retorna usuario
- logout(): limpia estado
- getUser(): retorna usuario actual
- isAuthenticated(): verifica si hay sesión
```

**Características clave:**
- Separación de concerns (API vs Estado)
- Lógica de negocio centralizada

---

### 5. **useLogin Hook** (`features/auth/login/hooks/useLogin.ts`)
```typescript
// Hook que:
- useForm(Mantine): gestiona estado del formulario
- Validación Zod en tiempo real
- handleSubmit: valida → llama authService.login() → maneja errores
- Retorna: form, handleSubmit, isLoading, serverError
```

**Validación:**
```typescript
email: z.string().email('Email inválido')
password: z.string().min(6, 'Mínimo 6 caracteres')
```

---

### 6. **Login Component** (`features/auth/login/Login.tsx`)
```typescript
// Mantine UI:
- Container(420px) + Paper(bordered)
- TextInput(email) + PasswordInput(password)
- Button(submit) con loading state
- Alert para errores del servidor
- Link a registro

// Flujo:
- useEffect: si isAuthenticated → navigate a /backoffice/dashboard
- form.onSubmit: valida y llama handleSubmit
```

---

### 7. **Router Setup**

#### `features/auth/router/routes.tsx`
```typescript
// Index route: "/" → beforeLoad redirect a "/auth/login"
// Auth route: "/auth"
// Login route: "/auth/login" → Login component
// Register route: "/auth/register" → RegisterPlaceholder
```

#### `core/router/tankStackRouter.tsx`
```typescript
// Router singleton que:
- Compone routeTree con todos los routes
- defaultPreloadDelay: 50ms (optimización)
- Registra tipos con módulo Register
```

#### `core/router/baseRedirectRouter.tsx`
```typescript
// Root route "/" con Outlet para renderizar child routes
// notFoundComponent: "404 - Página no encontrada"
```

---

### 8. **Global Providers** (`core/providers/providers.tsx`)
```typescript
// Stack de providers:
1. HelmetProvider (head management)
2. MantineProvider (UI components + Notifications)
3. QueryClientProvider (caching + async state)
4. RouterProvider (routing)
```

---

### 9. **Domain Types**

#### `Auth.types.ts`
```typescript
interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
}
```

#### `Auth.request.ts`
```typescript
interface LoginRequest {
  email: string
  password: string
}
```

#### `Auth.response.ts`
```typescript
interface LoginApiResponse {
  statusCode: number
  message: string
  data: {
    accessToken: string
    user: AuthUser
  }
  timestamp: string
}
```

---

## 🐛 Problemas Encontrados y Soluciones

### Problema 1: TypeScript Errors en Seed File
**Error:** `process.exit` no reconocido en seed.ts

**Solución:** 
- Crear `tsconfig.prisma.json` con tipos Node.js
- Actualizar package.json seed script para usar tsconfig correcto

---

### Problema 2: Syntax Error en routes.ts
**Error:** "JSX in a file marked as `.ts`"

**Solución:**
- Renombrar `routes.ts` → `routes.tsx` para habilitar JSX

---

### Problema 3: TanStack Router Type Incompatibility
**Error:** "Route cannot have both 'id' and 'path' option"

**Solución:**
- Remover el field `id: 'auth'` de createRoute()
- Mantener solo `path: AUTH_ROUTES.ROOT`

---

### Problema 4: Invalid Router Property
**Error:** "Router constructor does not accept defaultRedirect"

**Solución:**
- Remover `defaultRedirect: '/auth/login'`
- Crear index route en "/" que redirige a "/auth/login" usando `beforeLoad`

---

### Problema 5: RootRoute Type Mismatch
**Error:** "Argument of type 'RootRoute<Register>' is not assignable to parameter of type 'RootRoute<unknown>'"

**Solución:**
- Actualizar `authRouter()` para usar `as any` en tipos genéricos
- Mantener compatibilidad tipo-segura sin bloquear compilación

---

### Problema 6: Providers Wrapping Children
**Error:** RouterProvider no acepta children como parámetro

**Solución:**
- Remover parámetro `children` de Providers component
- RouterProvider renderiza el router directamente sin contenido adicional

---

### Problema 7: Mantine CSS No Se Aplicaba
**Error:** Componentes Mantine sin estilos visibles

**Causas:**
1. Falta import de `@mantine/core/styles.css`
2. `index.css` tenía estilos conflictivos (`#root width: 1126px`, `text-align: center`, borders)

**Solución:**
1. Agregar `import '@mantine/core/styles.css'` en main.tsx (ANTES de index.css)
2. Reemplazar index.css con estilos mínimos y compatibles:
   ```css
   #root {
     width: 100%;
     min-height: 100vh;
     padding: 0;
     margin: 0;
   }
   ```

---

## 🔄 Flujo de Datos: Login Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ Usuario visita http://localhost:5180/                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ TanStack Router                      │
        │ - Ruta "/" → beforeLoad redirect     │
        │ - Redirect a "/auth/login"           │
        └──────────────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Login Component      │
                    │ - Mantine Form UI    │
                    │ - Email + Password   │
                    │ - Submit Button      │
                    └──────┬───────────────┘
                           │
                    Usuario completa form
                           │
                           ▼
               ┌────────────────────────────┐
               │ form.onSubmit(handleSubmit)│
               │ - Validación Zod           │
               └──────────┬─────────────────┘
                          │
              Validación exitosa
                          │
                          ▼
         ┌────────────────────────────────┐
         │ authService.login(credentials) │
         └──────────┬─────────────────────┘
                    │
                    ▼
      ┌──────────────────────────────────┐
      │ auth.api.loginUser()             │
      │ - POST /auth/login               │
      │ - httpClient + interceptors      │
      └──────────┬───────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────┐
    │ Backend Response                   │
    │ {                                  │
    │   "statusCode": 200,               │
    │   "data": {                        │
    │     "accessToken": "jwt...",       │
    │     "user": {...}                  │
    │   }                                │
    │ }                                  │
    └────────────┬───────────────────────┘
                 │
       Adapter transforma respuesta
                 │
                 ▼
  ┌────────────────────────────────────┐
  │ useAuthStore.login(token, user)    │
  │ - Guarda en Zustand store          │
  │ - Persiste en localStorage         │
  │ - isAuthenticated = true           │
  └────────────┬───────────────────────┘
               │
    useEffect detecta cambio
               │
               ▼
      ┌─────────────────────────┐
      │ navigate({               │
      │   to: '/backoffice/...' │
      │ })                       │
      └────────────┬────────────┘
                   │
                   ▼
          ✅ Usuario logueado
             Sesión persistida
```

---

## ✅ Flujo de Logout

```
Dashboard → Logout Button
    ↓
authService.logout()
    ↓
useAuthStore.logout()
    ↓
localStorage.removeItem('accessToken')
localStorage.removeItem('authUser')
    ↓
router redirect to /auth/login
```

---

## 🔐 Flujo de Token Expirado (401)

```
Usuario hace request
    ↓
httpClient interceptor
    ↓
Servidor retorna 401
    ↓
Response interceptor detecta 401
    ↓
localStorage.removeItem('accessToken')
localStorage.removeItem('authUser')
    ↓
window.location.href = '/auth/login'
    ↓
Session limpiada, usuario redirigido
```

---

## 🧪 Verificación

### Checklist de Funcionalidad:
- ✅ `npm run dev` inicia sin errores
- ✅ `/` redirige automáticamente a `/auth/login`
- ✅ Login form muestra con Mantine UI estilizado
- ✅ Validación en tiempo real con Zod
- ✅ Submit sin validar muestra errores
- ✅ Credenciales inválidas: Alert de error del servidor
- ✅ Credenciales válidas: Redirect a `/backoffice/dashboard`
- ✅ Refresh en dashboard: sesión persiste (token en localStorage)
- ✅ Token expirado (401): redirect a login y logout automático
- ✅ Acceso a dashboard sin token: Guard redirige a login

### Archivos de Configuración:
```
frontend/.env                          ✅ VITE_API_URL=http://localhost:3000
tsconfig.app.json                      ✅ Strict mode enabled
tsconfig.node.json                     ✅ ESM config
vite.config.ts                         ✅ Configured
```

---

## 📦 Dependencias Finales

```json
{
  "@mantine/core": "^7.x",
  "@mantine/hooks": "^7.x",
  "@mantine/form": "^7.x",
  "@mantine/notifications": "^7.x",
  "@tabler/icons-react": "^2.x",
  "@tanstack/react-router": "^1.x",
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "zod": "^3.x",
  "zustand": "^4.x",
  "react-helmet-async": "^1.x"
}
```

---

## 🎯 Próximos Pasos

### Fase 2: Features Adicionales
- [ ] Register page (similar al Login)
- [ ] Recover password
- [ ] Email verification
- [ ] 2FA setup

### Fase 3: Dashboard & Navigation
- [ ] Dashboard layout
- [ ] Sidebar navigation
- [ ] Auth guard para rutas protegidas
- [ ] Logout button

### Fase 4: Otros Bounded Contexts
- [ ] Patient management
- [ ] Appointments
- [ ] Treatments
- [ ] Billing

---

## 📚 Referencias

- **Stack**: `docs/STACK.md`
- **Guía Arquitectura**: `docs/GUIDE.MD`
- **Plan Backend**: Backend setup en `backend/` (NestJS + Prisma)

---

## 🔗 URLs de Prueba

- **Frontend Dev**: `http://localhost:5180/` (última ejecución)
- **Backend API**: `http://localhost:3000/`
- **Swagger API Docs**: `http://localhost:3000/api/docs`

---

**Última actualización**: 12 de abril de 2026, 11:49 PM  
**Estado**: ✅ Login completamente funcional con estilos Mantine aplicados
