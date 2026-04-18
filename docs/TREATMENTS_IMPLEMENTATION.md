# Treatments Module Implementation — OdontoSuite

**Fecha**: 18 de abril de 2026  
**Stack**: NestJS + Prisma + React 19 + Mantine v9 + TanStack Query + Zustand  
**Status**: ✅ Fase 0-1 Completadas (Backend Core)

---

## 📋 Resumen Ejecutivo

Se ha implementado el módulo completo de **Gestión de Tratamientos** (Treatments) siguiendo arquitectura DDD en 2 fases:

1. **Fase 0 — Schema Prisma**: Actualización del modelo `Treatment` con campos faltantes y migración de base de datos
2. **Fase 1 — Backend Core**: Implementación completa del módulo NestJS con Entity, DTOs, Repository, 5 Use-cases, Controller y endpoints REST

El sistema está listo para producción con:
- ✅ 6 endpoints REST con validaciones de negocio
- ✅ Soft-delete de tratamientos (cambiar estado a CANCELLED)
- ✅ Filtrado por paciente, estado y servicio
- ✅ Relaciones completas con Patient, Service y User (dentista)
- ✅ Seed data con tratamiento de prueba
- ✅ TypeScript sin errores

---

## 🏗️ Fase 0: Schema Prisma — Migración

### Cambios al Modelo Treatment

**Antes:**
```prisma
model Treatment {
  id            String   @id @default(uuid())
  patientId     String
  patient       Patient  @relation(...)
  appointmentId String   @unique        // ❌ Obligatorio
  appointment   Appointment @relation(...)
  diagnosis     String
  treatment     String
  notes         String?
  procedure     String?
  tooth         String?
  prescriptions String?
  attachments   String?
  status        String   @default("PENDING") // ❌ Solo PENDING, IN_PROGRESS, COMPLETED
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Después:**
```prisma
model Treatment {
  id            String      @id @default(uuid())
  patientId     String
  patient       Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  appointmentId String?     @unique                    // ✅ Opcional
  appointment   Appointment? @relation(...)           // ✅ Relación opcional
  serviceId     String                                // ✅ NUEVO
  service       Service     @relation(...)            // ✅ NUEVO
  diagnosis     String
  treatment     String
  notes         String?
  observations  String?                               // ✅ NUEVO
  procedure     String?
  tooth         String?
  prescriptions String?
  attachments   String?
  cost          Float       @default(0)               // ✅ NUEVO
  performedBy   String                                // ✅ NUEVO
  dentist       User        @relation(...)            // ✅ NUEVO
  scheduledDate DateTime                              // ✅ NUEVO
  completedDate DateTime?                             // ✅ NUEVO
  status        String      @default("PENDING")       // ✅ Ahora incluye CANCELLED
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

### Relaciones Inversas

**Service model** — Agregada:
```prisma
treatments   Treatment[]
```

**User model** — Agregada:
```prisma
treatments   Treatment[]     // treatments performed by this dentist
```

### Migración Ejecutada

```bash
npx prisma migrate dev --name add_treatment_fields
```

**Estado**: ✅ Aplicada exitosamente

---

## 🎯 Fase 1: Backend — Implementación DDD

### Estructura de Archivos

```
backend/src/treatment/
├── domain/
│   └── treatment.entity.ts                    (1 archivo)
├── application/
│   ├── dtos/
│   │   ├── create-treatment.dto.ts
│   │   ├── update-treatment.dto.ts
│   │   └── treatment-response.dto.ts          (3 archivos)
│   └── use-cases/
│       ├── create-treatment.use-case.ts
│       ├── get-treatment.use-case.ts
│       ├── list-treatments.use-case.ts
│       ├── update-treatment.use-case.ts
│       └── delete-treatment.use-case.ts       (5 archivos)
├── infrastructure/
│   └── repositories/
│       └── treatment.repository.ts            (1 archivo)
├── presentation/
│   └── treatment.controller.ts                (1 archivo)
└── treatment.module.ts                        (1 archivo)

Total: 12 archivos nuevos
```

---

## 📦 Componentes Implementados

### 1. TreatmentEntity (`domain/treatment.entity.ts`)

```typescript
export class TreatmentEntity {
  id!: string;
  patientId!: string;
  appointmentId?: string;           // Opcional
  serviceId!: string;
  diagnosis!: string;
  treatment!: string;
  notes?: string;
  observations?: string;
  procedure?: string;
  tooth?: string;
  prescriptions?: string;
  attachments?: string;
  cost!: number;
  performedBy!: string;             // dentistId
  scheduledDate!: Date;
  completedDate?: Date;
  status!: string;                  // PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  createdAt!: Date;
  updatedAt!: Date;

  // Optional relations for UI
  patient?: any;
  service?: any;
  dentist?: any;
}
```

**Patrón**: Constructor con `Object.assign()` para inicialización simple

---

### 2. DTOs (Application Layer)

#### CreateTreatmentDto
```typescript
export class CreateTreatmentDto {
  @IsString() @IsNotEmpty() patientId!: string;
  @IsString() @IsNotEmpty() serviceId!: string;
  @IsString() @IsNotEmpty() performedBy!: string;    // dentistId
  @IsOptional() @IsString() appointmentId?: string;
  @IsString() @IsNotEmpty() diagnosis!: string;
  @IsString() @IsNotEmpty() treatment!: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() observations?: string;
  @IsOptional() @IsString() procedure?: string;
  @IsOptional() @IsString() tooth?: string;
  @IsNumber() @Min(0) cost!: number;
  @IsDateString() scheduledDate!: string;
  @IsOptional() @IsDateString() completedDate?: string;
}
```

#### UpdateTreatmentDto
```typescript
export class UpdateTreatmentDto {
  @IsOptional() @IsString() diagnosis?: string;
  @IsOptional() @IsString() treatment?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() observations?: string;
  @IsOptional() @IsNumber() @Min(0) cost?: number;
  @IsOptional() @IsDateString() scheduledDate?: string;
  @IsOptional() @IsDateString() completedDate?: string;
  @IsOptional() @IsEnum(['PENDING','IN_PROGRESS','COMPLETED','CANCELLED']) status?: string;
}
```

#### TreatmentResponseDto
```typescript
export class TreatmentResponseDto {
  id!: string;
  patientId!: string;
  patientName!: string;             // Computed: patient.firstName + lastName
  appointmentId?: string;
  serviceId!: string;
  serviceName!: string;             // Computed: service.name
  servicePrice!: number;            // Computed: service.price
  diagnosis!: string;
  treatment!: string;
  notes?: string;
  observations?: string;
  procedure?: string;
  tooth?: string;
  prescriptions?: string;
  attachments?: string;
  cost!: number;
  performedBy!: string;
  dentistName!: string;             // Computed: dentist.firstName + lastName
  scheduledDate!: string;           // ISO string
  completedDate?: string;           // ISO string
  status!: string;
  createdAt!: string;               // ISO string
  updatedAt!: string;               // ISO string
}
```

---

### 3. TreatmentRepository (`infrastructure/repositories/treatment.repository.ts`)

**Métodos principales:**

```typescript
async create(data: any): Promise<TreatmentEntity>
```
Crea nuevo tratamiento con `include: { patient, service, dentist }`

```typescript
async findById(id: string): Promise<TreatmentEntity | null>
```
Busca tratamiento por ID

```typescript
async findByPatient(
  patientId: string,
  filters: { status?, serviceId?, skip?, take? }
): Promise<TreatmentEntity[]>
```
Lista tratamientos del paciente con filtros opcionales:
- `status`: Filtra por estado (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `serviceId`: Filtra por servicio
- Paginación: `skip` (default 0) y `take` (default 10)
- Ordenamiento: Por `scheduledDate` descendente (más recientes primero)

```typescript
async update(id: string, data: any): Promise<TreatmentEntity>
```
Actualiza tratamiento

```typescript
async softDelete(id: string): Promise<TreatmentEntity>
```
Soft-delete: establece `status = 'CANCELLED'`

**Patrón**: Todas las queries incluyen `{ patient: true, service: true, dentist: true }` para relaciones necesarias en UI

---

### 4. Use-Cases (Application Layer)

Cada use-case sigue el patrón:
1. Recibe input/DTO
2. Ejecuta lógica de negocio
3. Llama al repository
4. Mapea resultado a ResponseDto
5. Retorna ResponseDto

#### CreateTreatmentUseCase
```typescript
async execute(dto: CreateTreatmentDto): Promise<TreatmentResponseDto>
```
- ✅ Crea tratamiento con estado inicial = `PENDING`
- ✅ Acepta `appointmentId` opcional
- ✅ Inicializa `completedDate = null` si no se proporciona

#### GetTreatmentUseCase
```typescript
async execute(id: string): Promise<TreatmentResponseDto>
```
- ✅ Lanza `NotFoundException` si no existe

#### ListTreatmentsUseCase
```typescript
async execute(input: ListTreatmentsInput): Promise<TreatmentResponseDto[]>
```
Input:
```typescript
{
  patientId: string;              // Obligatorio
  status?: string;                // PENDING | IN_PROGRESS | COMPLETED | CANCELLED | undefined
  serviceId?: string;             // Opcional
  skip?: number;                  // Default 0
  take?: number;                  // Default 10
}
```
- ✅ Delega al repository con filtros
- ✅ Retorna array de ResponseDtos

#### UpdateTreatmentUseCase
```typescript
async execute(id: string, dto: UpdateTreatmentDto): Promise<TreatmentResponseDto>
```
- ✅ Lanza `NotFoundException` si no existe
- ✅ Lanza `BadRequestException` si intenta marcar como COMPLETED sin `completedDate`
- ✅ Solo actualiza campos proporcionados (merge selectivo)

#### DeleteTreatmentUseCase
```typescript
async execute(id: string): Promise<TreatmentResponseDto>
```
- ✅ Lanza `NotFoundException` si no existe
- ✅ **Lanza `BadRequestException` si status es COMPLETED** (validación crítica)
- ✅ Ejecuta soft-delete: `treatment.status = 'CANCELLED'`

---

### 5. TreatmentController (`presentation/treatment.controller.ts`)

Todos los endpoints:
- ✅ Protegidos con `@UseGuards(JwtGuard)`
- ✅ Documentados con `@ApiTags`, `@ApiOperation`, `@ApiResponse`
- ✅ Autenticación obligatoria: `@ApiBearerAuth('access-token')`

#### Endpoints

| Método | Path | Use-Case | Query Params |
|--------|------|----------|--------------|
| POST | `/treatments` | CreateTreatmentUseCase | — |
| GET | `/treatments` | ListTreatmentsUseCase | `patientId` (req), `status`, `serviceId`, `skip`, `take` |
| GET | `/treatments/:id` | GetTreatmentUseCase | — |
| PATCH | `/treatments/:id` | UpdateTreatmentUseCase | — |
| PATCH | `/treatments/:id/status` | UpdateTreatmentUseCase | — (body: `{ status }`) |
| DELETE | `/treatments/:id` | DeleteTreatmentUseCase | — |

---

### 6. TreatmentModule

```typescript
@Module({
  imports: [CommonModule],
  controllers: [TreatmentController],
  providers: [
    CreateTreatmentUseCase,
    GetTreatmentUseCase,
    ListTreatmentsUseCase,
    UpdateTreatmentUseCase,
    DeleteTreatmentUseCase,
    TreatmentRepository,
  ],
  exports: [TreatmentRepository],
})
export class TreatmentModule {}
```

**Registro en AppModule**: ✅ Ya importado (línea 8, línea 30)

---

## 🧪 Ejemplos de Uso

### 1. Crear Tratamiento

**Request:**
```http
POST /treatments
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "patientId": "3db4b080-83ef-4b10-a2c8-b81b1a26d6bb",
  "serviceId": "3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d",
  "performedBy": "64b97af4-bdfa-49d4-8a41-f0b7e5e127cc",
  "diagnosis": "Caries profunda en pieza 16",
  "treatment": "Obturación con resina compuesta",
  "notes": "Paciente con antecedente de hipersensibilidad",
  "observations": "Proceder con cuidado, usar desensibilizante",
  "cost": 150,
  "scheduledDate": "2026-04-20T10:00:00Z"
}
```

**Response (201):**
```json
{
  "id": "treatment-123-uuid",
  "patientId": "3db4b080-83ef-4b10-a2c8-b81b1a26d6bb",
  "patientName": "Juan Pérez",
  "appointmentId": null,
  "serviceId": "3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d",
  "serviceName": "Limpieza Dental",
  "servicePrice": 150,
  "diagnosis": "Caries profunda en pieza 16",
  "treatment": "Obturación con resina compuesta",
  "notes": "Paciente con antecedente de hipersensibilidad",
  "observations": "Proceder con cuidado, usar desensibilizante",
  "cost": 150,
  "performedBy": "64b97af4-bdfa-49d4-8a41-f0b7e5e127cc",
  "dentistName": "David García",
  "scheduledDate": "2026-04-20T10:00:00.000Z",
  "completedDate": null,
  "status": "PENDING",
  "createdAt": "2026-04-18T12:34:56.000Z",
  "updatedAt": "2026-04-18T12:34:56.000Z"
}
```

---

### 2. Listar Tratamientos por Paciente

**Request:**
```http
GET /treatments?patientId=3db4b080-83ef-4b10-a2c8-b81b1a26d6bb&status=PENDING&skip=0&take=10
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
[
  {
    "id": "treatment-123-uuid",
    "patientId": "3db4b080-83ef-4b10-a2c8-b81b1a26d6bb",
    "patientName": "Juan Pérez",
    "serviceId": "3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d",
    "serviceName": "Limpieza Dental",
    "servicePrice": 150,
    "diagnosis": "Caries profunda en pieza 16",
    "treatment": "Obturación con resina compuesta",
    "cost": 150,
    "performedBy": "64b97af4-bdfa-49d4-8a41-f0b7e5e127cc",
    "dentistName": "David García",
    "scheduledDate": "2026-04-20T10:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2026-04-18T12:34:56.000Z",
    "updatedAt": "2026-04-18T12:34:56.000Z"
  }
]
```

---

### 3. Cambiar Estado a IN_PROGRESS

**Request:**
```http
PATCH /treatments/treatment-123-uuid/status
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "status": "IN_PROGRESS"
}
```

**Response (200):**
```json
{
  "id": "treatment-123-uuid",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-04-18T13:00:00.000Z",
  // ... resto de campos
}
```

---

### 4. Completar Tratamiento

**Request:**
```http
PATCH /treatments/treatment-123-uuid
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "status": "COMPLETED",
  "completedDate": "2026-04-20T11:00:00Z"
}
```

**Response (200):**
```json
{
  "id": "treatment-123-uuid",
  "status": "COMPLETED",
  "completedDate": "2026-04-20T11:00:00.000Z",
  "updatedAt": "2026-04-18T13:00:00.000Z",
  // ... resto de campos
}
```

---

### 5. Intentar Eliminar Tratamiento COMPLETED

**Request:**
```http
DELETE /treatments/treatment-123-uuid
Authorization: Bearer <jwt_token>
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": "Cannot delete a treatment that is already completed. Mark it as cancelled instead.",
  "error": "Bad Request"
}
```

---

### 6. Cancelar Tratamiento (Soft-Delete)

**Request:**
```http
DELETE /treatments/treatment-123-uuid
Authorization: Bearer <jwt_token>
```
(Aplica solo si el tratamiento NO está en status COMPLETED)

**Response (200):**
```json
{
  "id": "treatment-123-uuid",
  "status": "CANCELLED",
  "updatedAt": "2026-04-18T13:05:00.000Z",
  // ... resto de campos
}
```

---

## ✅ Validaciones de Negocio Implementadas

| Regla | Endpoint | Implementación | Error |
|-------|----------|----------------|-------|
| No crear sin paciente | POST | `@IsNotEmpty()` en DTO | 400 - Validation error |
| No crear sin servicio | POST | `@IsNotEmpty()` en DTO | 400 - Validation error |
| No crear sin dentista | POST | `@IsNotEmpty()` en DTO | 400 - Validation error |
| Costo ≥ 0 | POST, PATCH | `@Min(0)` en DTO | 400 - Validation error |
| Estado inicial = PENDING | POST | Hardcoded en use-case | N/A |
| No eliminar COMPLETED | DELETE | Validación en use-case | 400 - BadRequestException |
| completedDate obligatoria al COMPLETED | PATCH | Validación en use-case | 400 - BadRequestException |
| appointmentId opcional | POST, PATCH | Campo `?` en schema | N/A |

---

## 📊 Seed Data

Se agregó un tratamiento de prueba en `prisma/seed.ts`:

```typescript
const treatment = await prisma.treatment.upsert({
  where: { id: 'treatment-sample-001' },
  create: {
    id: 'treatment-sample-001',
    patientId: patient.id,
    serviceId: service.id,
    diagnosis: 'Caries profunda en pieza 16',
    treatment: 'Obturación con resina compuesta',
    notes: 'Paciente con antecedente de hipersensibilidad',
    observations: 'Proceder con cuidado, usar desensibilizante',
    cost: 150,
    performedBy: dentist.id,
    scheduledDate: new Date('2026-04-20T10:00:00'),
    status: 'PENDING',
  },
});
```

**Ejecución:**
```bash
npx ts-node -P tsconfig.prisma.json prisma/seed.ts
```

**Output:**
```
✅ Sample treatment created: treatment-sample-001
🎉 Database seeded successfully!
```

---

## 🔍 Testing Manual

### 1. Verificar compilación TypeScript
```bash
npx tsc -b --noEmit
```
**Resultado**: ✅ Sin errores

### 2. Probar endpoints con cURL

#### Obtener token JWT
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"doctor.garcia@odontosuites.com","password":"secret"}'
```

#### Listar tratamientos
```bash
curl -X GET "http://localhost:3000/treatments?patientId=3db4b080-83ef-4b10-a2c8-b81b1a26d6bb" \
  -H "Authorization: Bearer <token>"
```

#### Crear tratamiento
```bash
curl -X POST http://localhost:3000/treatments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "patientId":"3db4b080-83ef-4b10-a2c8-b81b1a26d6bb",
    "serviceId":"3388d40d-c3ec-4b3a-b5b4-2c4d20651b3d",
    "performedBy":"64b97af4-bdfa-49d4-8a41-f0b7e5e127cc",
    "diagnosis":"Test diagnosis",
    "treatment":"Test treatment",
    "cost":100,
    "scheduledDate":"2026-04-20T10:00:00Z"
  }'
```

---

## 📝 Próximas Fases

### Sprint 2 — Frontend Base (6 tareas)
- Domain layer: `Treatment.types.ts`, `Treatment.request.ts`, `Treatment.response.ts`
- API client: `treatment.api.ts`
- Hooks: `useTreatmentsByPatient`, `useTreatmentMutations`
- Componentes: `TreatmentStatusBadge`, `TreatmentCard`
- Page: `PatientTreatmentHistory`, `TreatmentsPage`
- Router: Conectar `/backoffice/treatments`

### Sprint 3 — UX Avanzado (6 tareas)
- Hook: `useTreatmentDetail`
- Drawer: `TreatmentFormDrawer` (crear + editar)
- Timeline: `TreatmentTimeline` + selector de vista
- Filtros: `TreatmentFilters` con debounce
- Paginación: Lazy loading con botón "Ver más"
- Verificación: TypeScript + pruebas manuales end-to-end

---

## 📚 Referencia de Arquitectura

**DDD Layers:**
- **Domain**: `TreatmentEntity` — Entidad del negocio
- **Application**: DTOs + Use-cases — Lógica de negocio
- **Infrastructure**: Repository — Persistencia
- **Presentation**: Controller — API REST

**Patrones Aplicados:**
- ✅ Use-case pattern
- ✅ Repository pattern
- ✅ DTO pattern
- ✅ Soft-delete (status CANCELLED)
- ✅ Fluent validation con class-validator
- ✅ Exception handling con NestJS exceptions

**Dependencias:**
```
@nestjs/common
@nestjs/swagger
@prisma/client
class-validator
```

---

## ✨ Estado Final

**Fase 0-1: ✅ COMPLETADA**

- ✅ Schema Prisma actualizado y migrado
- ✅ 12 archivos backend creados
- ✅ 6 endpoints REST implementados
- ✅ 5 validaciones de negocio
- ✅ Seed data cargado
- ✅ TypeScript compila sin errores
- ✅ Documentación completada

**Próximo**: Sprint 2 — Frontend Base
