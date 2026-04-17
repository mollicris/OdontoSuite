# Dashboard Implementation - OdontoSuite Backoffice

**Fecha**: 17 de abril de 2026  
**Stack**: React 19 + Vite + Mantine v9 + TanStack Router v1 + Zustand  
**Status**: ✅ Completado

---

## 📋 Plan Original

### Contexto
Implementar el Dashboard del backoffice siguiendo los lineamientos arquitectónicos DDD (Domain-Driven Design) definidos en `docs/GUIDE.MD` y `docs/STACK.md`. El login ya está completo, por lo que el siguiente paso es crear un layout profesional con:
- **Sidebar Navigation**: acceso a todos los bounded contexts
- **Header**: información del usuario y logout
- **Main Content**: página dashboard con estadísticas
- **Auth Guard**: proteger rutas del backoffice
- **Responsive Design**: collapse del sidebar en mobile

### Dependencias Utilizadas
```bash
# Ya instaladas en fase Login, reutilizadas:
@mantine/core @mantine/hooks @tabler/icons-react
@tanstack/react-router zustand axios
```

---

## 🏗️ Estructura de Archivos Creados

```
frontend/src/
│
├── shared/
│   ├── constants/
│   │   └── routes.ts                        ✅ MODIFICADO - agregado BACKOFFICE routes
│   └── guard/
│       └── authGuard.tsx                    ✅ MODIFICADO - mejorado checkAuthBeforeLoad
│
└── features/
    └── backoffice/
        ├── router/
        │   ├── metadata.ts                  ✅ BACKOFFICE_ROUTES constants
        │   ├── routes.tsx                   ✅ createBackofficeRoutes() factory
        │   └── router.tsx                   ✅ backofficeRouter(rootRoute) export
        │
        ├── layout/
        │   └── BackofficeLayout.tsx         ✅ AppShell: Header + Sidebar + Outlet
        │
        └── dashboard/
            ├── Dashboard.tsx                ✅ Página principal con stats
            └── hooks/
                └── useDashboard.ts          ✅ Mock data y lógica de dashboard
```

---

## 📝 Implementación Detallada

### 1. **Router Configuration** (`features/backoffice/router/`)

#### `metadata.ts`
Define las rutas del backoffice como constantes reutilizables:
```typescript
export const BACKOFFICE_ROUTES = {
  ROOT: '/backoffice',
  DASHBOARD: '/backoffice/dashboard',
  PATIENTS: '/backoffice/patients',
  APPOINTMENTS: '/backoffice/appointments',
  TREATMENTS: '/backoffice/treatments',
  BILLING: '/backoffice/billing',
  CLINIC: '/backoffice/clinic',
  REPORTS: '/backoffice/reports',
} as const;
```

**Características:**
- Constantes centralizadas para evitar errores de typo
- `as const` para type inference automático
- Reutilizable en componentes y navigación

---

#### `routes.tsx`
Define todas las rutas del backoffice usando TanStack Router:

```typescript
export function createBackofficeRoutes(rootRoute: RootRoute) {
  // Ruta principal: /backoffice (requiere autenticación)
  const backofficeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: BACKOFFICE_ROUTES.ROOT,
    component: BackofficeLayout,
    beforeLoad: checkAuthBeforeLoad,  // ⚠️ Protege todo el subtree
  });

  // 7 Bounded Contexts como rutas hijas:
  const dashboardRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'dashboard',
    component: Dashboard,
  });

  const patientsRoute = createRoute({
    getParentRoute: () => backofficeRoute,
    path: 'patients',
    component: () => <PlaceholderPage section="Gestión de Pacientes" />,
  });

  // ... más rutas (appointments, treatments, billing, clinic, reports)
  
  // Retorna array de rutas para composición en tankStackRouter
  return [backofficeRoute.addChildren([
    dashboardRoute,
    patientsRoute,
    appointmentsRoute,
    treatmentsRoute,
    billingRoute,
    clinicRoute,
    reportsRoute,
  ])];
}
```

**Características clave:**
- **Auth Guard**: `beforeLoad: checkAuthBeforeLoad` protege automáticamente todas las rutas hijas
- **Placeholder Components**: PlaceholderPage para secciones futuras (no genera TypeScript errors)
- **Lazy Routes**: cada sección puede migrar a componentes reales sin cambiar estructura

---

#### `router.tsx`
Factory function que expone el router del backoffice:

```typescript
export function backofficeRouter(rootRoute: RootRoute<any>) {
  return createBackofficeRoutes(rootRoute as any);
}
```

**Patrón Builder:**
- Acepta `rootRoute` como parámetro
- Retorna array de routes para composición
- Permite desacoplamiento de router setup

---

### 2. **Layout Component** (`features/backoffice/layout/BackofficeLayout.tsx`)

Implementa la estructura principal del backoffice usando Mantine `AppShell`:

```
┌─────────────────────────────────────────────────┐
│ HEADER (70px)                                   │
│ Logo | Usuario + Avatar + Menu                  │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│   SIDEBAR    │  MAIN CONTENT (Outlet)          │
│  (280px)     │                                  │
│ - Dashboard  │  <-- Renderiza Dashboard.tsx    │
│ - Pacientes  │      o cualquier otra página    │
│ - Citas      │                                  │
│ - Tratam.    │                                  │
│ - Factura.   │                                  │
│ - Clínica    │                                  │
│ - Reportes   │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

#### Implementación:

```typescript
export function BackofficeLayout() {
  const [mobileOpened, setMobileOpened] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Sidebar navigation items
  const navItems = [
    { label: 'Dashboard', icon: IconLayoutDashboard, path: BACKOFFICE_ROUTES.DASHBOARD },
    { label: 'Pacientes', icon: IconUsers, path: BACKOFFICE_ROUTES.PATIENTS },
    // ... más items
  ];

  const handleLogout = () => {
    useAuthStore.getState().logout();
    window.location.href = '/auth/login';  // Full page reload para limpiar estado
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}
      padding="md"
    >
      {/* Header con logo, usuario y logout */}
      <AppShell.Header>
        {/* Logo */}
        <Burger ... />
        <Title order={2}>🦷 OdontoSuite</Title>

        {/* User menu */}
        <Menu shadow="md" position="bottom-end">
          <Menu.Target>
            <Group gap={10}>
              <Avatar name={user?.fullName} />
              <Box>
                <Text size="sm">{user?.firstName}</Text>
                <Text size="xs" c="dimmed">{user?.email}</Text>
              </Box>
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>Configuración</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" onClick={handleLogout}>Cerrar Sesión</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </AppShell.Header>

      {/* Sidebar Navigation */}
      <AppShell.Navbar p="md">
        <Stack gap={0}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} />}
              onClick={() => navigate({ to: item.path })}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      {/* Main content area */}
      <AppShell.Main>
        <Outlet />  {/* Renderiza página actual */}
      </AppShell.Main>
    </AppShell>
  );
}
```

**Características:**
- **Mobile Responsive**: sidebar colapsable en pantallas pequeñas (<640px)
- **User Info**: muestra nombre y email del usuario logueado
- **Logout Flow**: limpia store y redirige a login
- **Navigation**: NavLink items navegan usando TanStack Router

---

### 3. **Dashboard Page** (`features/backoffice/dashboard/Dashboard.tsx`)

Página de inicio con estadísticas y actividad reciente:

```typescript
export function Dashboard() {
  const { stats, upcomingAppointments, recentActivity } = useDashboard();
  const { user } = useAuthStore();
  const today = new Date();

  return (
    <Container size="xl">
      {/* Welcome section */}
      <Stack gap="lg">
        <Box>
          <Title order={1}>Bienvenido, {user?.firstName}! 👋</Title>
          <Text c="dimmed">
            {today.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Box>

        {/* Statistics Cards (SimpleGrid) */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {/* Total Patients */}
          <StatsCard
            icon={IconUsers}
            label="Pacientes Totales"
            value={stats.totalPatients}
            color="blue"
          />
          {/* Today Appointments */}
          <StatsCard
            icon={IconCalendar}
            label="Citas Hoy"
            value={stats.todayAppointments}
            color="green"
          />
          {/* Completed Treatments */}
          <StatsCard
            icon={IconStethoscope}
            label="Tratamientos Completos"
            value={stats.completedTreatments}
            color="violet"
          />
          {/* Pending Billing */}
          <StatsCard
            icon={IconReceipt}
            label="Facturación Pendiente"
            value={stats.pendingBilling}
            color="orange"
          />
        </SimpleGrid>

        {/* Próximas Citas y Actividad Reciente (2 columns) */}
        <Grid gap="lg">
          {/* Upcoming Appointments */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg">
              <Title order={3}>Próximas Citas</Title>
              <Table striped highlightOnHover>
                {/* Tabla con citas próximas */}
              </Table>
            </Card>
          </Grid.Col>

          {/* Recent Activity */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg">
              <Title order={3}>Actividad Reciente</Title>
              <Stack gap="sm">
                {/* Lista de actividades */}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
```

**Secciones:**
1. **Welcome Header**: saludo personalizado + fecha actual
2. **Stats Cards**: 4 métricas clave en grid responsivo
3. **Próximas Citas**: tabla con citas del día/próximas
4. **Actividad Reciente**: lista de eventos recientes

---

### 4. **Dashboard Hook** (`features/backoffice/dashboard/hooks/useDashboard.ts`)

Hook que retorna datos mock (posteriormente conectará a APIs reales):

```typescript
export function useDashboard() {
  const stats = {
    totalPatients: 142,
    todayAppointments: 8,
    completedTreatments: 25,
    pendingBilling: 3500,
  };

  const upcomingAppointments = [
    {
      id: '1',
      patientName: 'Juan Pérez',
      time: '10:00 AM',
      type: 'Limpieza',
    },
    // ... más citas
  ];

  const recentActivity = [
    {
      id: '1',
      action: 'Nueva cita agendada',
      user: 'Dr. García',
      timestamp: '2 horas atrás',
    },
    // ... más actividades
  ];

  return { stats, upcomingAppointments, recentActivity };
}
```

**Patrón:**
- Hook reutilizable para lógica y datos
- Fácil migración a datos reales (fetch API)
- Mantiene componente limpio y enfocado en presentación

---

### 5. **Routes Setup en Core Router** (`core/router/tankStackRouter.tsx`)

Composición final de todos los routers:

```typescript
import { authRouter } from '../../features/auth/router/router';
import { backofficeRouter } from '../../features/backoffice/router/router';

// Factory functions retornan arrays de routes
const authRoutes = authRouter(rootRoute);        // [indexRoute, authRoute]
const backofficeRoutes = backofficeRouter(rootRoute);  // [backofficeRoute]

// Composición en tankStackRouter
const routeTree = rootRoute.addChildren([
  ...authRoutes,        // Esprea index y auth routes
  ...backofficeRoutes,  // Esprea backoffice routes
]);

export const router = new Router({
  routeTree,
  defaultPreloadDelay: 50,
});
```

**Key Point:** Spread operator (`...`) descompone arrays para evitar duplicar rootRoute

---

### 6. **Auth Guard** (`shared/guard/authGuard.tsx`)

Protege rutas requiriendo autenticación:

```typescript
export function checkAuthBeforeLoad() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: '/auth/login' as any });
  }
}
```

**Características:**
- Se ejecuta en `beforeLoad` de TanStack Router
- Si no hay token: lanza redirect automático
- Protege toda la rama `/backoffice/*` recursivamente

---

## 🐛 Problemas Encontrados y Soluciones

### Problema 1: Route Duplication Error
**Error**: `Uncaught Error: Duplicate routes found with id: __root__`

**Causa**: 
- `createAuthRoutes()` retornaba `rootRoute.addChildren([...])`
- `createBackofficeRoutes()` retornaba `backofficeRoute.addChildren([...])`
- En `tankStackRouter.tsx`, intentábamos hacer `rootRoute.addChildren([authRoutes, backofficeRoutes])`
- Esto creaba referencias duplicadas a rootRoute

**Solución**:
1. Cambiar `createAuthRoutes()` para retornar array de routes, no result de `.addChildren()`
2. Cambiar `createBackofficeRoutes()` para retornar array con backofficeRoute
3. En tankStackRouter, usar spread operator: `rootRoute.addChildren([...authRoutes, ...backofficeRoutes])`

```typescript
// Antes (❌ INCORRECTO)
const authRoutes = authRouter(rootRoute);  // Retorna rootRoute.addChildren(...)
const backofficeRoutes = backofficeRouter(rootRoute);  // Retorna backofficeRoute.addChildren(...)
const routeTree = rootRoute.addChildren([authRoutes, backofficeRoutes]);  // ❌ Duplica rootRoute

// Después (✅ CORRECTO)
const authRoutes = authRouter(rootRoute);  // Retorna [indexRoute, authRoute.addChildren(...)]
const backofficeRoutes = backofficeRouter(rootRoute);  // Retorna [backofficeRoute.addChildren(...)]
const routeTree = rootRoute.addChildren([...authRoutes, ...backofficeRoutes]);  // ✅ Spread arrays
```

---

### Problema 2: TypeScript Redirect Type Mismatch
**Error**: `Type '"/auth/login"' is not assignable to type '"." | ".."'`

**Causa**: TanStack Router v1 tiene strict typing en `beforeLoad` redirects

**Solución**: Use `as any` type cast
```typescript
throw redirect({ to: '/auth/login' as any });
```

---

### Problema 3: Storage Function Type Mismatch (Zustand)
**Error**: `Type '(_key: string) => AuthStore | null' is not assignable to type '(name: string) => StorageValue<AuthStore> | ...'`

**Causa**: Zustand persist middleware tiene tipos muy estrictos para custom storage

**Solución**: Cast entire storage object as `any`
```typescript
storage: {
  getItem: (_key: string) => {
    // ... implementation
    return { token, user, isAuthenticated } as any;
  },
  // ... setItem, removeItem
} as any,
```

---

### Problema 4: Mantine Grid Gutter Property
**Error**: `Property 'gutter' does not exist on type 'GridProps'`

**Causa**: Mantine v9 cambió la prop de `gutter` a `gap` en Grid

**Solución**: Reemplazar `gutter="lg"` por `gap="lg"`
```typescript
// Antes
<Grid gutter="lg">

// Después
<Grid gap="lg">
```

---

## 🔄 Flujo de Datos: Acceso al Dashboard

```
┌────────────────────────────────────┐
│ Usuario logueado                   │
│ Token en localStorage              │
│ Zustand isAuthenticated = true     │
└────────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │ Usuario navega a:      │
    │ /backoffice/dashboard  │
    └────────┬───────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ TanStack Router             │
    │ beforeLoad: checkAuthBeforeLoad
    │ - Lee useAuthStore          │
    │ - Verifica isAuthenticated  │
    └────────┬────────────────────┘
             │
      ¿Token existe?
             │
      Sí ───┴─── No
      │           │
      ▼           ▼
   Permite   Throw redirect
   acceso    to /auth/login
      │
      ▼
┌─────────────────────────┐
│ Renderiza:              │
│ 1. BackofficeLayout     │
│ 2. Dashboard (Outlet)   │
└─────────────────────────┘
      │
      ▼
┌───────────────────────────────┐
│ Dashboard muestra:            │
│ - Header con user info        │
│ - Sidebar navigation          │
│ - Stats cards                 │
│ - Upcoming appointments       │
│ - Recent activity             │
└───────────────────────────────┘
```

---

## ✅ Flujo de Logout

```
Usuario clicks "Cerrar Sesión" en Menu
    ↓
handleLogout() en BackofficeLayout
    ↓
useAuthStore.getState().logout()
    ├─ localStorage.removeItem('accessToken')
    ├─ localStorage.removeItem('authUser')
    └─ isAuthenticated = false
    ↓
window.location.href = '/auth/login'
    ↓
✅ Sesión limpiada, usuario redirigido
```

---

## ✅ Acceso Denegado (Sin Token)

```
Usuario intenta acceder a /backoffice
sin token en localStorage
    ↓
checkAuthBeforeLoad()
    ↓
isAuthenticated = false
    ↓
throw redirect({ to: '/auth/login' })
    ↓
✅ Usuario automáticamente redirigido
```

---

## 🧪 Verificación

### Checklist Funcional:
- ✅ `npm run dev` inicia sin errores TypeScript
- ✅ Login → redirige a `/backoffice/dashboard`
- ✅ Dashboard muestra layout completo (header + sidebar + main)
- ✅ Header muestra nombre y email del usuario
- ✅ Sidebar navigation items navegan a rutas correctas
- ✅ Stats cards muestran datos mock
- ✅ Próximas Citas tabla con datos
- ✅ Actividad Reciente lista con datos
- ✅ Logout button limpia sesión y redirige
- ✅ Acceso directo a `/backoffice/*` sin token → redirige a login
- ✅ Responsive en mobile (sidebar colapsable)

### Rutas Protegidas:
```
/backoffice/              ⚠️ beforeLoad: checkAuthBeforeLoad
├── dashboard             ✅ Protegida automáticamente
├── patients              ✅ Protegida automáticamente
├── appointments          ✅ Protegida automáticamente
├── treatments            ✅ Protegida automáticamente
├── billing               ✅ Protegida automáticamente
├── clinic                ✅ Protegida automáticamente
└── reports               ✅ Protegida automáticamente
```

---

## 📦 Estructura de Componentes

```
BackofficeLayout
├── AppShell.Header
│   ├── Burger (mobile toggle)
│   ├── Title "🦷 OdontoSuite"
│   └── Menu (logout)
│       ├── Avatar
│       ├── User Info (name + email)
│       └── Menu.Item (Logout)
│
├── AppShell.Navbar
│   └── NavLink items (7 contextos)
│       ├── Dashboard
│       ├── Pacientes
│       ├── Citas
│       ├── Tratamientos
│       ├── Facturación
│       ├── Clínica
│       └── Reportes
│
└── AppShell.Main (Outlet)
    └── Dashboard.tsx
        ├── Welcome Header
        ├── SimpleGrid (4 stats cards)
        │   ├── Total Patients (Card + Icon)
        │   ├── Today Appointments (Card + Icon)
        │   ├── Completed Treatments (Card + Icon)
        │   └── Pending Billing (Card + Icon)
        └── Grid (2 columns)
            ├── Próximas Citas (Table)
            └── Actividad Reciente (Stack)
```

---

## 🎯 Patrón DDD en el Backoffice

Cada bounded context se implementa como:

```
features/backoffice/
├── router/                  ← Routing layer
│   ├── metadata.ts          (constantes de rutas)
│   ├── routes.tsx           (definiciones de rutas)
│   └── router.tsx           (factory function)
│
├── layout/                  ← Presentation layer (AppShell)
│   └── BackofficeLayout.tsx
│
└── dashboard/               ← Future expansion
    ├── Dashboard.tsx        (presentación)
    └── hooks/
        └── useDashboard.ts  (lógica + datos)
```

### Extensión Futura:
Agregar nuevos bounded contexts siguiendo el mismo patrón:

```
features/backoffice/
├── router/ ... (stays the same)
├── layout/ ... (stays the same)
├── dashboard/ ... (current)
├── patients/                ← Nuevo BC
│   ├── router/
│   ├── layout/
│   ├── list/
│   ├── create/
│   ├── detail/
│   └── hooks/
├── appointments/            ← Nuevo BC
│   ├── router/
│   ├── layout/
│   └── ... (similar)
└── ...
```

---

## 🔗 Integración con Auth

**Login → Dashboard Flow:**
```
1. Usuario completa login en Login.tsx
2. authService.login() → token + user guardados en Zustand
3. useEffect en Login.tsx detecta isAuthenticated = true
4. navigate({ to: '/backoffice/dashboard' })
5. TanStack Router ejecuta beforeLoad
6. checkAuthBeforeLoad verifica token
7. ✅ Acceso permitido → Dashboard renderiza
```

**Logout Flow:**
```
1. Usuario clicks "Cerrar Sesión" en BackofficeLayout
2. handleLogout() → useAuthStore.logout()
3. Zustand limpia store + localStorage
4. window.location.href = '/auth/login'
5. ✅ Sesión limpiada, usuario redirigido
```

---

## 📝 Guía de Extensión

### Agregar Nueva Sección (ej: Reportes)

1. **Crear componente**:
```typescript
// features/backoffice/reports/Reports.tsx
export function Reports() {
  return <div>Reportes - En construcción</div>;
}
```

2. **Actualizar router** (`features/backoffice/router/routes.tsx`):
```typescript
// Ya existe como PlaceholderPage
// Simplemente reemplazar con Reports component
const reportsRoute = createRoute({
  getParentRoute: () => backofficeRoute,
  path: 'reports',
  component: Reports,  // ← Cambio
});
```

3. **Actualizar metadata** si es necesario (opcional)

4. **No requiere cambios en**:
- `features/auth/router/*`
- `core/router/tankStackRouter.tsx`
- `features/backoffice/layout/BackofficeLayout.tsx`

---

## 📚 Referencias

- **Stack**: `docs/STACK.md`
- **Guía Arquitectura**: `docs/GUIDE.MD`
- **Login Implementation**: `docs/LOGIN_IMPLEMENTATION.md`
- **Mantine Documentation**: https://mantine.dev/
- **TanStack Router**: https://tanstack.com/router/latest/

---

## 🔗 URLs de Prueba

- **Frontend Dev**: `http://localhost:5173/`
- **Login Page**: `http://localhost:5173/auth/login`
- **Dashboard**: `http://localhost:5173/backoffice/dashboard`
- **Backend API**: `http://localhost:3000/`

---

## 📊 Cambios Realizados en Archivos Existentes

| Archivo | Cambio |
|---------|--------|
| `shared/constants/routes.ts` | ✅ Agregado BACKOFFICE routes object |
| `shared/guard/authGuard.tsx` | ✅ Mejorado checkAuthBeforeLoad con redirect |
| `core/router/tankStackRouter.tsx` | ✅ Agregado backofficeRouter composition |
| `features/auth/router/routes.tsx` | ✅ Cambio de return type (array en lugar de .addChildren) |
| `main.tsx` | ✅ Ya tiene @mantine/core/styles.css import |

---

## 🚀 Próximas Fases

### Fase 1: Dashboard Completo (ACTUAL ✅)
- [x] Layout con AppShell (header, sidebar, main)
- [x] Navigation sidebar con 7 bounded contexts
- [x] Dashboard page con stats cards
- [x] Auth guard para proteger backoffice
- [x] Logout functionality

### Fase 2: Patient Management
- [ ] Patient list page
- [ ] Create/edit patient forms
- [ ] Patient detail view
- [ ] Integration con API backend

### Fase 3: Appointments
- [ ] Calendar view
- [ ] Create/edit appointments
- [ ] Appointment scheduling
- [ ] Notifications

### Fase 4: Otros Contextos
- [ ] Treatments
- [ ] Billing/Invoicing
- [ ] Clinic management
- [ ] Reporting/Analytics

---

**Última actualización**: 17 de abril de 2026  
**Estado**: ✅ Dashboard completamente implementado con layout profesional, auth guard y navegación funcional
