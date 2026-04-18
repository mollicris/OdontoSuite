# STACK.md — OdontoSuite

Definición completa del stack tecnológico aplicando **Domain-Driven Design (DDD)** para un sistema de gestión de clínicas dentales.

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────┐
│         React 19 + TypeScript + Vite            │
│         Frontend (Presentation Layer)           │
│  Mantine UI + TanStack Router + TanStack Query  │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS / REST
┌──────────────────▼──────────────────────────────┐
│       Node.js (Express/NestJS)                  │
│      Backend (Application + Infrastructure)    │
│       DDD Bounded Contexts                      │
└──────────────────┬──────────────────────────────┘
         ┌────────┼────────┬──────────┐
         │        │        │          │
    ┌────▼──┐ ┌───▼───┐ ┌──▼──┐ ┌───▼──────┐
    │  PSQL │ │Firebase│ │Redis│ │Cloud     │
    │(Main) │ │(Auth)  │ │Cache│ │Storage   │
    └───────┘ └────────┘ └─────┘ │(Images)  │
                                  └──────────┘
```

---

## 2. Diseño Orientado por Dominio (DDD)

OdontoSuite se organiza en **Bounded Contexts** (contextos acotados) alineados con el negocio dental:

### **Bounded Contexts**

```
OdontoSuite
│
├── 👤 Identity Context
│   └── Gestión de autenticación, usuarios, roles, permisos
│
├── 🦷 Clinic Context  
│   └── Información de la clínica, horarios, servicios
│
├── 👥 Patient Context
│   └── Pacientes, historiales médicos, contactos
│
├── 📅 Appointment Context
│   └── Citas, disponibilidad, calendario
│
├── 🔬 Treatment Context
│   └── Tratamientos, diagnósticos, prescripciones
│
├── 💰 Billing Context
│   └── Facturación, pagos, reportes financieros
│
└── 📊 Reporting Context
    └── Reportes, auditoría, analítica
```

Cada Bounded Context es **independiente** en el backend. En el frontend, se mapean a **features** en `/features`.

---

## 3. Stack Técnico por Capa DDD

### **Frontend (Presentation Layer)**

| Aspecto | Tecnología | Propósito |
|---------|-----------|----------|
| Framework | React 19 + TypeScript 6 | UI reactiva, type-safe |
| Build | Vite 8 | Bundling rápido, HMR |
| Routing | TanStack Router | SPA routing con loader support |
| State (caché) | TanStack Query v5 | Sincronización servidor-cliente |
| State (global) | Zustand | Estado persistible entre navegaciones |
| UI Components | Mantine Core + Hooks | Componentes accesibles, temas |
| Formularios | Mantine Form + Zod | Validación y control |
| Tablas | TanStack Table | Tablas dinámicas, paginación, sorting |
| Dates | Mantine Dates + dayjs | Input de fechas, validación |
| HTTP | Axios + interceptores | Peticiones, retry automático, token refresh |
| Meta tags | Helmet Async | SEO, descripciones dinámicas |
| Notificaciones | Mantine Notifications | Toast, alertas |
| reCAPTCHA | react-google-recaptcha | Validación anti-bots |

**Estructura de carpetas:**
```
src/
├── core/                    # Infraestructura (Cliente HTTP, Router, Providers)
├── shared/                  # Código reutilizable (componentes UI, hooks, utils)
└── features/                # Módulos de negocio (1 por Bounded Context)
    ├── auth/
    ├── clinic/
    ├── patient/
    ├── appointment/
    ├── treatment/
    ├── billing/
    └── reporting/
```

### **Backend (Node.js)**

| Aspecto | Tecnología | Propósito |
|---------|-----------|----------|
| Runtime | Node.js 18+ | Server-side runtime |
| Framework | Express o NestJS | HTTP API, middleware |
| ORM | TypeORM o Prisma | Mapeo a BD, migrations |
| Validación | Zod o class-validator | Validación de DTOs |
| Logging | Winston o Pino | Auditoría, debugging |
| Testing | Jest + Supertest | Unit y E2E tests |
| Auth | JWT + bcrypt | Autenticación, encriptación |
| Rate Limiting | express-rate-limit | DDoS protection |
| CORS | cors | Seguridad cross-origin |

**Estructura (por Bounded Context):**
```
backend/
├── src/
│   ├── common/              # Middlewares, guards, decoradores globales
│   ├── identity/            # Identity Bounded Context (auth, users)
│   ├── clinic/              # Clinic Bounded Context
│   ├── patient/             # Patient Bounded Context
│   ├── appointment/         # Appointment Bounded Context
│   ├── treatment/           # Treatment Bounded Context
│   ├── billing/             # Billing Bounded Context
│   └── reporting/           # Reporting Bounded Context
│
└── (cada context tiene):
    ├── domain/              # Entidades, Value Objects, Agregados
    ├── application/         # Use Cases, DTOs, mappers
    ├── infrastructure/      # Repositorios, servicios externos
    └── presentation/        # Controladores, routers
```

### **Base de Datos (Infraestructura)**

| Aspecto | Tecnología | Propósito |
|---------|-----------|----------|
| DBMS Principal | PostgreSQL 15+ | Datos relacionales, ACID |
| Caché | Redis | Cache de sesiones, datos frecuentes |
| Auth Externo | Firebase Auth | Autenticación escalable, OAuth2 |
| Storage | Cloud Storage (GCS/S3) | Imágenes, radiografías, documentos |

**Schemas PostgreSQL:**
```
┌─────────────────────────┐
│ Identity Schema         │ users, roles, permissions
├─────────────────────────┤
│ Clinic Schema           │ clinics, services, schedules
├─────────────────────────┤
│ Patient Schema          │ patients, medical_history
├─────────────────────────┤
│ Appointment Schema      │ appointments, slots
├─────────────────────────┤
│ Treatment Schema        │ treatments, diagnoses, rx
├─────────────────────────┤
│ Billing Schema          │ invoices, payments, expenses
├─────────────────────────┤
│ Audit Schema            │ audit_logs, change_history
└─────────────────────────┘
```

---

## 4. Requisitos No Funcionales → Stack

### **Seguridad**
- ✅ Encriptación en tránsito: HTTPS (TLS 1.3+)
- ✅ Encriptación en reposo: PostgreSQL encryption extension
- ✅ Autenticación: JWT + Firebase Auth
- ✅ MFA: Firebase Phone/SMS + TOTP
- ✅ Control de acceso: Roles basados en el contexto (RBAC) + Policies (ABAC)
- ✅ Auditoría: Audit logs en BD (Winston logger → Audit Schema)
- ✅ Secrets: Rotación con dotenv + variables de entorno

### **Disponibilidad**
- ✅ Uptime 99.5%: Deployment en cloud (AWS/GCP) con auto-scaling
- ✅ Backup: PostgreSQL backup diario + snapshots
- ✅ Recuperación: Replicación standby (hot/warm standby)
- ✅ Monitoreo: CloudWatch / Datadog + alertas
- ✅ CDN: CloudFlare para assets estáticos

### **Rendimiento**
- ✅ Carga inicial <3s: Code splitting en Vite, lazy loading
- ✅ Búsqueda <500ms: Índices en PostgreSQL + Redis caché
- ✅ Lazy loading: TanStack Query + Suspense
- ✅ Compresión: gzip/brotli en Nginx
- ✅ Optimización de imágenes: Sharp para radiografías, WebP format

### **Cumplimiento Legal (Compliance)**
- ✅ GDPR: Right to be forgotten, consent logs, data export
- ✅ HIPAA (USA): Encriptación end-to-end, audit trails, access logs
- ✅ Datos de salud sensibles: Encriptación field-level en BD
- ✅ Retención: Políticas automáticas de eliminación

### **Escalabilidad**
- ✅ Horizontal: Load balancing (Nginx/HAProxy)
- ✅ Vertical: Connection pooling (PgBouncer)
- ✅ Caché: Redis cluster para datos frecuentes
- ✅ BD: Índices particionados por fecha/clínica
- ✅ API: Paginación obligatoria (limit/offset)

---

## 5. DevOps & Deployment

| Aspecto | Herramienta | Función |
|---------|-----------|---------|
| Containerización | Docker | Imagen del app + BD dev |
| Orquestación | Docker Compose (dev) / K8s (prod) | Orquestar servicios |
| CI/CD | GitHub Actions | Tests, build, deploy automático |
| Hosting | AWS/GCP/Digital Ocean | Infraestructura en la nube |
| Reverse Proxy | Nginx | Balanceo, SSL termination, compresión |
| Monitoring | Prometheus + Grafana | Métricas y alertas |
| Logging | ELK Stack o Datadog | Logs centralizados |

**Docker Compose (Desarrollo):**
```yaml
services:
  app:        # Node.js backend
  frontend:   # Vite dev server
  postgres:   # BD principal
  redis:      # Cache
  mailhog:    # Email testing
```

---

## 6. Code Quality & Testing

| Aspecto | Herramienta | Función |
|---------|-----------|---------|
| Linting | Biomejs + ESLint (frontend) | Formateo, errores estáticos |
| Type Checking | TypeScript (strict mode) | Seguridad de tipos |
| Unit Tests | Vitest (frontend), Jest (backend) | Tests unitarios |
| E2E Tests | Playwright o Cypress | Tests de usuario final |
| Integration Tests | Supertest (backend) | Tests API + BD |
| Coverage | Vitest UI, Jest coverage | Reporte de cobertura |
| Git Hooks | Husky + lint-staged | Pre-commit checks |
| Commits | Conventional Commits | Mensajes estructurados |

---

## 7. Flujo de Datos DDD

### **Lectura (Query)**
```
Frontend (React Component)
  ↓
Hook local (usePatient.ts)
  ↓
Application Service (PatientService)
  ↓
TanStack Query (caché) → API → Backend
  ↓
Backend Query Handler
  ↓
Domain Model + Repository
  ↓
PostgreSQL
```

### **Escritura (Command)**
```
Frontend (Formulario)
  ↓
Hook local (useCreatePatient.ts)
  ↓
Application Service (PatientService)
  ↓
TanStack Mutation → API → Backend
  ↓
Backend Command Handler
  ↓
Domain Aggregate (Patient Aggregate Root)
  ↓
Repository (persist)
  ↓
PostgreSQL + Evento de dominio
  ↓
Event Bus → Otros contextos (si aplica)
```

---

## 8. Dependencias Principales

### **Frontend** (`package.json`)
```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "vite": "^8.0.4",
    "@tanstack/react-router": "^latest",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x",
    "mantine": "^7.x",
    "@mantine/form": "^7.x",
    "@mantine/dates": "^7.x",
    "@mantine/notifications": "^7.x",
    "@tanstack/react-table": "^8.x",
    "axios": "^1.x",
    "zod": "^3.x",
    "react-helmet-async": "^2.x",
    "dayjs": "^1.x",
    "react-google-recaptcha": "^3.x"
  },
  "devDependencies": {
    "typescript": "^6.0.2",
    "@vitejs/plugin-react": "^latest",
    "eslint": "^9.x",
    "@biomejs/biome": "^1.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "vitest": "^1.x",
    "happy-dom": "^12.x",
    "@testing-library/react": "^14.x",
    "@testing-library/user-event": "^14.x",
    "@vitest/ui": "^1.x"
  }
}
```

### **Backend** (Node.js)
```json
{
  "dependencies": {
    "express": "^4.x",
    "typescript": "^5.x",
    "typeorm": "^0.3.x",
    "zod": "^3.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "winston": "^3.x",
    "redis": "^4.x",
    "express-rate-limit": "^7.x",
    "cors": "^2.x",
    "helmet": "^7.x"
  },
  "devDependencies": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "@types/express": "^4.x",
    "@types/node": "^20.x"
  }
}
```

---

## 9. Convenciones del Proyecto

### **Nomenclatura de Ramas**
```bash
git checkout feat/JIRA-110-patient-search    # Feature
git checkout fix/JIRA-111-auth-bug           # Bug fix
git checkout chore/update-deps               # Mantenimiento
```

### **Commits**
```
feat(patient): add search by CPF
fix(appointment): timezone handling
docs: update API docs
refactor: extract PatientService
test: add unit tests for Patient domain
```

### **Pull Requests**
```
#JIRA-110 Add patient search

## Description
- Implement search by name, email, CPF
- Add pagination (20 items per page)

## Testing
- [x] Unit tests added
- [x] API integration tested
- [x] Manual QA passed
```

---

## 10. Localización de Archivos Clave

```
📦 OdontoSuite
├── 📄 CLAUDE.md                    ← Guía para Claude Code
├── 📄 STACK.md                     ← Este archivo
├── 📄 ARCHITECTURE.MD              ← Diagrama arquitectónico
├── 📄 GUIDE.MD                     ← Guía de carpetas + patrones
├── 📄 NOT_FUNCTIONAL_REQUERIMENTS.MD ← Dependencias
│
├── 📁 src/                         ← Frontend (React)
│   ├── core/                       ← Providers, Router, HTTP Client
│   ├── shared/                     ← UI, Hooks, Utils
│   └── features/                   ← Bounded Contexts (auth, patient, etc)
│
├── 📁 backend/                     ← Backend (Node.js) — TBD
│   ├── src/
│   │   ├── common/
│   │   ├── identity/
│   │   ├── patient/
│   │   ├── appointment/
│   │   └── ...otros contextos
│   └── package.json
│
├── 📁 docker/                      ← Dockerfiles + docker-compose
├── 📄 docker-compose.yml
├── 📄 nginx.conf
├── 📁 .github/
│   └── workflows/                  ← CI/CD pipelines
│
└── 📄 .env.example                 ← Template de variables
```

---

## Resumen: De DDD a Código

| Concepto DDD | Implementación Frontend | Implementación Backend |
|---|---|---|
| **Bounded Context** | `/features/{context}/` | `/backend/src/{context}/` |
| **Domain Entities** | `domain/*.types.ts` | `domain/entities/` |
| **Value Objects** | Tipos TypeScript + Zod | `domain/value-objects/` |
| **Aggregates** | Tipos compuestos | Entidades raíz + especificación |
| **Repository** | API + Stack (caché) | `infrastructure/repositories/` |
| **Use Cases** | `application/services/` | `application/use-cases/` |
| **Event Sourcing** | TanStack Query invalidation | Event Bus + Audit logs |
| **Anti-Corruption Layer** | Adapter (response → domain) | DTO + Mapper |

---

**OdontoSuite = DDD + Clean Architecture + TanStack Ecosystem + Node.js Backend**
