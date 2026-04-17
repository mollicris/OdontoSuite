# base-react-v2 — Arquitectura consolidada

> Documento de referencia arquitectónica para el equipo. Describe la estructura de carpetas en su estado actual, el flujo de datos entre capas, la filosofía de estado global y los patrones de diseño recomendados.

---

## Índice

1. [File System](#file-system)
2. [Capas principales](#capas-principales)
3. [Anatomía de un Feature](#anatomía-de-un-feature)
4. [Flujo de datos — camino completo (con caché y store)](#flujo-de-datos--camino-completo-con-caché-y-store)
5. [Flujo de datos — camino directo (sin caché ni store)](#flujo-de-datos--camino-directo-sin-caché-ni-store)
6. [Flujo POST — escritura](#flujo-post--escritura)
7. [Filosofía del Store](#filosofía-del-store)
8. [Patrones de diseño recomendados](#patrones-de-diseño-recomendados)

---

## File System

```
src/
├── app.tsx                          ← Entry point de la aplicación
├── app.css                          ← Estilos globales base
│
├── core/                            ← Infraestructura base del sistema
│   ├── providers/
│   │   └── providers.tsx            ← Composición de providers globales (QueryClient, Theme, etc.)
│   └── router/
│       ├── baseRedirectRouter.tsx   ← Ruta raíz con redirección base
│       └── tankStackRouter.tsx      ← Configuración e instancia del router (TanStack)
│
├── shared/                          ← Código reutilizable entre features
│   ├── assets/                      ← Imágenes, íconos, fuentes compartidas
│   ├── components/
│   │   ├── ui/                      ← Componentes de UI genéricos (Button, Modal, Input, etc.)
│   │   └── examples/                ← Componentes de referencia / prototipos
│   ├── constants/                   ← Constantes globales (rutas, claves, enums)
│   ├── guard/                       ← Guards de ruta compartidos (authGuard, backofficeGuard)
│   ├── helpers/                     ← Funciones auxiliares de UI
│   ├── hooks/
│   │   ├── useCheckAuthenticated.ts ← Verifica sesión activa
│   │   └── useStorage.ts            ← Abstracción de localStorage / sessionStorage
│   └── utils/                       ← Utilidades puras (formatters, parsers, validators)
│
└── features/                        ← Módulos de negocio independientes
    ├── auth/
    │   ├── layout/                  ← Layout exclusivo de autenticación
    │   ├── login/                   ← Página y lógica de login
    │   ├── register/                ← Página y lógica de registro
    │   └── router/
    │       ├── metadata.ts          ← Títulos y metadatos de las rutas
    │       ├── routes.ts            ← Definición de rutas del feature
    │       └── router.tsx           ← Factory function que ensambla el sub-árbol de rutas
    │
    ├── backoffice/
    │   ├── layout/
    │   ├── dashboard/
    │   ├── users/
    │   ├── admin/
    │   └── router/
    │       ├── metadata.ts
    │       ├── routes.ts
    │       └── router.tsx
    │
    ├── landing/
    │   ├── layout/
    │   ├── home/
    │   ├── about/
    │   ├── contact/
    │   ├── product/
    │   │   └── product.tsx
    │   ├── loaders/                 ← Loaders de TanStack Router (data fetching pre-render)
    │   └── router/
    │       ├── metadata.ts
    │       ├── routes.ts
    │       └── router.tsx
    │
    └── error404/                    ← Página de error manejada globalmente
```

---

## Capas principales

### `core/` — Infraestructura base

Contiene todo lo que la aplicación necesita para existir: la instancia del cliente HTTP (axios con interceptores), la configuración leída de variables de entorno, la instancia del router, y la composición de providers globales.

**Ningún feature importa directamente desde otro feature.** Si un feature necesita algo del sistema base (cliente HTTP, configuración), lo obtiene desde `core/`. Si necesita algo reutilizable (hooks, utils, componentes), lo obtiene desde `shared/`.

```
core/
  providers/   ← QueryClientProvider, ThemeProvider, i18n, etc.
  router/      ← Instancia única del router (Singleton), rutas raíz y redirección
```

> **Patrón aplicado:** `core/router/tankStackRouter.tsx` es el único punto donde el router es creado. Es un Singleton: toda la aplicación consume la misma referencia.

---

### `shared/` — Datos compartidos

Código que **no pertenece a ningún feature en particular** pero es utilizado por más de uno. Un componente o hook en `shared/` no conoce el dominio de ningún feature concreto.

| Subcarpeta       | Contenido                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `components/ui/` | Componentes visuales sin lógica de negocio                       |
| `constants/`     | Valores estáticos: rutas, keys de localStorage, códigos de error |
| `guard/`         | Funciones `beforeLoad` de TanStack Router para proteger rutas    |
| `hooks/`         | Hooks de utilidad general (auth check, storage)                  |
| `utils/`         | Funciones puras, sin efectos secundarios                         |
| `helpers/`       | Auxiliares de presentación (MetaTags, redirect helpers)          |

---

### `features/` — Módulos de negocio

Cada carpeta dentro de `features/` es un **módulo autónomo**. Puede tener sus propias rutas, su propio layout, sus propias páginas y su propia lógica de datos.

Los features mayores (como `backoffice/`) envuelven sub-features menores (`users/`, `dashboard/`, `admin/`). Cada sub-feature puede tener o no rutas propias, pero todas son ensambladas por la factory del feature padre.

**Regla de oro:** un feature no importa directamente desde otro feature. Si necesita algo de otro feature, esa pieza debe moverse a `shared/`.

---

## Anatomía de un Feature

Un feature complejo con acceso a datos sigue esta estructura interna:

```
features/<nombre>/
├── domain/
│   ├── <Entidad>.types.ts       ← Tipos de la entidad (interfaces de dominio)
│   ├── <Entidad>.request.ts     ← Tipos del body de las peticiones
│   └── <Entidad>.response.ts    ← Tipos de la respuesta de la API
│
├── infrastructure/
│   ├── api/
│   │   └── <entidad>.api.ts     ← Llamadas HTTP usando el cliente de core/
│   ├── stacks/
│   │   └── <entidad>.stack.ts   ← Caché con TanStack Query (queryKeys, queries, mutations)
│   └── store/
│       └── <entidad>.store.ts   ← Estado global persistible (Zustand u otro)
│
├── application/
│   └── <entidad>.service.ts     ← Métodos de orquestación: llaman a stack, store y api
│
├── layout/                      ← Layout del feature (si aplica)
├── <página>/
│   ├── <página>.tsx             ← Componente de vista
│   └── hooks/
│       └── use<Página>.ts       ← Hook local: maneja formularios, llama al service
│
└── router/
    ├── metadata.ts
    ├── routes.ts
    └── router.tsx
```

---

## Flujo de datos — camino completo (con caché y store)

Para lecturas que requieren caché o persistencia en estado global:

```
View (TSX)
  │
  └─► Hook local (use<Página>.ts)
        │  Llama a un método del Application Service
        │
        └─► Application Service (<entidad>.service.ts)
              │
              ├─► Stack (TanStack Query)        ← ¿Está en caché?
              │     Si hay hit → retorna dato cacheado
              │     Si no → delega a la capa de API
              │
              ├─► API (<entidad>.api.ts)         ← Petición HTTP usando cliente de core/
              │     Respuesta mapeada al tipo de dominio (Adapter)
              │
              └─► Store (<entidad>.store.ts)     ← Actualiza estado global si corresponde
                    │
                    └─► El store notifica a los componentes suscritos
                          → El hook recibe el dato del store
                          → La View re-renderiza con el dato actual
```

**El dato fluye así:**

1. La `View` llama al hook.
2. El hook llama al `Application Service`.
3. El `Application Service` consulta primero el `Stack` (caché de TanStack Query).
4. Si no hay caché, el stack llama a la `API`.
5. La respuesta es adaptada al tipo de dominio (`domain/`).
6. El `Application Service` actualiza el `Store` si el dato debe estar disponible en múltiples lugares.
7. El hook lee del store (o del retorno directo del service) y la `View` se actualiza.

---

## Flujo de datos — camino directo (sin caché ni store)

Para lecturas simples donde el dato solo se usa en esa vista:

```
View (TSX)
  │
  └─► Hook local (use<Página>.ts)
        │  Llama directamente a la API o al stack
        │
        └─► Stack / API (<entidad>.api.ts)
              │
              └─► Retorna el dato directo al hook
                    → La View renderiza el dato
```

No hay `Store` involucrado. No hay `Application Service`. El hook retorna los datos directamente a la vista. Este es el path preferido cuando el dato no necesita compartirse con otras partes de la app.

---

## Flujo POST — escritura

Para mutaciones (crear, actualizar, eliminar):

```
View (TSX) — formulario
  │
  └─► Hook local (use<Formulario>.ts)
        │  Mantiene el estado del formulario (react-hook-form / estado local)
        │  Al submit llama al Application Service
        │
        └─► Application Service (<entidad>.service.ts)
              │
              ├─► (Opcional) Guarda temporalmente en Store
              │     → útil para mantener datos entre pasos de un wizard
              │
              ├─► Llama a la API (<entidad>.api.ts)
              │     → Petición POST/PUT/PATCH/DELETE
              │
              └─► Al recibir respuesta:
                    ├─► Invalida / actualiza el Stack (caché) si corresponde
                    ├─► Actualiza el Store si el dato resultante debe ser global
                    └─► El Application Service puede o NO retornar valor
                          (los datos actualizados ya están en Store/Stack
                           y los componentes suscritos se actualizan solos)
```

**El Application Service no siempre necesita retornar algo.** Si el store o el stack ya notifican a los consumidores, el retorno explícito es redundante. El service retorna valor solo cuando el hook necesita reaccionar de forma específica al resultado (ej. redirigir, mostrar un toast con un ID generado).

---

## Filosofía del Store

> El store **no es un cajón de variables globales**. Es una capa de sincronización para datos ya recuperados que deben estar disponibles en múltiples partes del proyecto sin volver a solicitarlos.

### Cuándo SÍ usar el store

- Un dato fue recuperado de la API y debe mostrarse en dos o más lugares no relacionados del árbol de componentes (ej. datos del usuario activo en sidebar y en header).
- El dato persiste entre navegaciones y no queremos repetir la petición en cada montaje.

### Cuándo NO usar el store

| Tentación                                               | Alternativa correcta                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| Guardar `isLoading`, `isOpen`, `isSelected` en el store | Estado local `useState` en el componente que lo necesita             |
| Guardar flags de navegación o UI en el store            | Pasar por `props` de padre a hijo o usar `context` local del feature |
| Guardar el paso activo de un formulario en el store     | Estado local del componente o `useReducer`                           |
| Compartir un dato entre padre e hijo vía store          | Pasar el dato como `prop` directamente                               |

**Principio guía:** si el dato puede pasarse por referencia (props o callbacks), no necesita el store. El store existe para romper dependencias entre ramas del árbol que no tienen relación directa.

---

## Patrones de diseño recomendados

### Singleton — Cliente HTTP

El cliente Axios (o fetch wrapper) se instancia **una sola vez** en `core/` y se exporta como instancia. Ningún feature crea su propia instancia.

```ts
// core/api/httpClient.ts
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
});

// Interceptor global de autenticación
httpClient.interceptors.request.use(attachToken);
httpClient.interceptors.response.use(onSuccess, onError);

export { httpClient };
```

Todos los `<entidad>.api.ts` importan `httpClient` desde `core/`. Así los interceptores (token, refresh, manejo de errores) se aplican globalmente sin repetirlos.

---

### Adapter — Respuesta API → Dominio

La API externa puede cambiar su contrato. El dominio de la aplicación no debe depender de esa estructura. Se usa un **Adapter** que transforma la respuesta al tipo del dominio.

```ts
// features/landing/domain/Product.response.ts
export interface ProductApiResponse {
  product_id: number;
  product_name: string;
  unit_price: number;
}

// features/landing/infrastructure/api/product.api.ts
import type { Product } from "../../domain/Product.types";
import type { ProductApiResponse } from "../../domain/Product.response";

const toProduct = (raw: ProductApiResponse): Product => ({
  id: raw.product_id,
  name: raw.product_name,
  price: raw.unit_price,
});

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await httpClient.get<ProductApiResponse>(`/products/${id}`);
  return toProduct(data); // ← Adapter aplicado aquí
};
```

La `View` y el `Application Service` solo conocen `Product`, nunca `ProductApiResponse`.

---

### Builder — Construcción del router

Cada feature expone una **factory function** (Builder) que recibe `rootRoute` y ensambla su sub-árbol de rutas. El router principal las compone sin conocer los detalles internos de cada feature.

```ts
// features/landing/router/router.tsx
export const landingRouter = (rootRoute: RootRoute) => {
  const landingLayout = createRoute({ getParentRoute: () => rootRoute, ... })
  const homeRoute    = createRoute({ getParentRoute: () => landingLayout, ... })
  const productRoute = createRoute({ getParentRoute: () => landingLayout, ... })
  return landingLayout.addChildren([homeRoute, productRoute])
}

// core/router/tankStackRouter.tsx
const routeTree = rootRoute.addChildren([
  landingRouter(rootRoute),
  authRouter(rootRoute),
  backofficeRouter(rootRoute),
])
```

Agregar un nuevo feature es añadir una línea al ensamblado. Los features no se conocen entre sí.

---

### Resumen de responsabilidades por capa

| Capa                     | Responsabilidad                               | Conoce a                         |
| ------------------------ | --------------------------------------------- | -------------------------------- |
| `domain/`                | Tipos e interfaces del negocio                | Nadie                            |
| `infrastructure/api/`    | Peticiones HTTP, adaptación de respuesta      | `domain/`, `core/httpClient`     |
| `infrastructure/stacks/` | Caché con TanStack Query                      | `infrastructure/api/`, `domain/` |
| `infrastructure/store/`  | Estado global persistible                     | `domain/`                        |
| `application/`           | Orquestación de stacks, store y api           | Todas las de `infrastructure/`   |
| `hooks/` (en página)     | Estado de UI, formularios, llamada al service | `application/`, `shared/hooks/`  |
| `View` (TSX)             | Renderizado, interacción del usuario          | `hooks/`, `shared/components/`   |

---

> **Como regla general:** las dependencias apuntan siempre hacia adentro (hacia el dominio), nunca hacia afuera. La View no conoce la API. La API no conoce el Store. El Store no conoce la View. Esto garantiza que cada capa puede cambiar independientemente sin romper las demás.
