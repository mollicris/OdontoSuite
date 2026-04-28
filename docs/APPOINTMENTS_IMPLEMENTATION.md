# Módulo de Citas/Appointments — OdontoSuite

**Fecha**: 19 de abril de 2026  
**Stack**: NestJS + Prisma + React 19 + Mantine v9 + TanStack Query  
**Status**: ✅ Implementación Completa (Backend + Frontend)

---

## 📋 Resumen Ejecutivo

Se ha implementado el módulo completo de **Gestión de Citas** (Appointments) con soporte para:

- ✅ Creación de citas con disponibilidad de dentistas
- ✅ Búsqueda de disponibilidad por rango de fechas
- ✅ Gestión de estados: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- ✅ Validaciones de conflicto (solapamiento de horarios)
- ✅ Cancelación con motivo
- ✅ Vinculación automática con Treatments (una cita → un tratamiento)
- ✅ Filtros por paciente, dentista, clínica, estado, rango de fechas
- ✅ Vista de calendario interactivo
- ✅ 6 endpoints REST con validaciones de negocio
- ✅ 8+ componentes React con UI sofisticada en español
- ✅ TypeScript sin errores en backend y frontend
- ✅ Integración completa con React Query

---

## 🏗️ Schema Prisma

### Modelo Appointment (Ya Implementado)

```prisma
model Appointment {
  id              String      @id @default(uuid())
  clinicId        String
  clinic          Clinic      @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  patientId       String
  patient         Patient     @relation(fields: [patientId], references: [id], onDelete: Cascade)
  dentistId       String
  dentist         User        @relation(fields: [dentistId], references: [id])
  serviceId       String
  service         Service     @relation(fields: [serviceId], references: [id])
  startTime       DateTime                        // Hora inicio de cita
  endTime         DateTime                        // Hora fin de cita
  status          String      @default("SCHEDULED") // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  notes           String?
  cancelReason    String?                         // Motivo de cancelación
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  treatment       Treatment?  @relation(onDelete: Cascade)
  
  @@index([clinicId])
  @@index([patientId])
  @@index([dentistId])
  @@index([serviceId])
  @@index([startTime])
  @@map("appointments")
}
```

**Relaciones:**
- `clinic` — Clínica donde se realiza la cita
- `patient` — Paciente que asiste
- `dentist` — Profesional (User con rol DENTIST)
- `service` — Servicio a realizar (Limpieza, Obturación, etc)
- `treatment` — Tratamiento creado a partir de esta cita (1:1 opcional)

---

## 🎯 Implementación Backend

### Estructura de Archivos

```
backend/src/appointment/
├── domain/
│   ├── appointment.entity.ts
│   └── availability.value-object.ts            (2 archivos)
├── application/
│   ├── dtos/
│   │   ├── create-appointment.dto.ts
│   │   ├── update-appointment.dto.ts
│   │   ├── check-availability.dto.ts
│   │   └── appointment-response.dto.ts         (4 archivos)
│   └── use-cases/
│       ├── create-appointment.use-case.ts
│       ├── list-appointments.use-case.ts
│       ├── get-appointment.use-case.ts
│       ├── update-appointment.use-case.ts
│       ├── cancel-appointment.use-case.ts
│       └── check-dentist-availability.use-case.ts (6 archivos)
├── infrastructure/
│   └── repositories/
│       └── appointment.repository.ts           (1 archivo)
├── presentation/
│   └── appointment.controller.ts               (1 archivo)
└── appointment.module.ts                       (1 archivo)

Total: 16 archivos nuevos
```

---

## 📦 Componentes Backend

### 1. Domain Entities

#### AppointmentEntity (`domain/appointment.entity.ts`)
```typescript
export class AppointmentEntity {
  id!: string;
  clinicId!: string;
  patientId!: string;
  dentistId!: string;
  serviceId!: string;
  startTime!: Date;
  endTime!: Date;
  status!: string;           // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  notes?: string;
  cancelReason?: string;
  createdAt!: Date;
  updatedAt!: Date;
  
  // Optional relations
  clinic?: any;
  patient?: any;
  dentist?: any;
  service?: any;
  
  getDurationMinutes(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }
  
  isUpcoming(): boolean {
    return this.startTime > new Date() && this.status !== 'CANCELLED';
  }
  
  isPast(): boolean {
    return this.endTime < new Date();
  }
  
  canBeCancelled(): boolean {
    return this.status === 'SCHEDULED' && this.isUpcoming();
  }
}
```

#### AvailabilityValueObject (`domain/availability.value-object.ts`)
```typescript
export class TimeSlot {
  startTime!: Date;
  endTime!: Date;
  isAvailable!: boolean;    // true si está disponible
  reason?: string;          // Motivo si no está disponible
}

export class DentistAvailability {
  dentistId!: string;
  dentistName!: string;
  date!: Date;
  slots!: TimeSlot[];       // Array de slots de 30 minutos
  
  getNextAvailableSlot(): TimeSlot | null {
    return this.slots.find(s => s.isAvailable) || null;
  }
}
```

---

### 2. DTOs (Application Layer)

#### CreateAppointmentDto
```typescript
export class CreateAppointmentDto {
  @IsString() @IsNotEmpty() patientId!: string;
  @IsString() @IsNotEmpty() dentistId!: string;
  @IsString() @IsNotEmpty() serviceId!: string;
  @IsString() @IsNotEmpty() clinicId!: string;
  @IsDateString() startTime!: string;           // ISO 8601
  @IsDateString() endTime!: string;
  @IsString() @IsOptional() notes?: string;
}
```

#### UpdateAppointmentDto
```typescript
export class UpdateAppointmentDto {
  @IsOptional() @IsDateString() startTime?: string;
  @IsOptional() @IsDateString() endTime?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(['SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED']) status?: string;
}
```

#### CheckAvailabilityDto
```typescript
export class CheckAvailabilityDto {
  @IsString() @IsNotEmpty() dentistId!: string;
  @IsDateString() startDate!: string;           // Inicio del rango
  @IsDateString() endDate!: string;
  @IsNumber() @Min(15) durationMinutes!: number; // Duración de la cita en minutos
}
```

#### AppointmentResponseDto
```typescript
export class AppointmentResponseDto {
  id!: string;
  clinicId!: string;
  clinicName!: string;       // Computed
  patientId!: string;
  patientName!: string;      // Computed: patient.firstName + lastName
  dentistId!: string;
  dentistName!: string;      // Computed: dentist.firstName + lastName
  serviceId!: string;
  serviceName!: string;      // Computed: service.name
  servicePrice!: number;     // Computed: service.price
  startTime!: string;        // ISO string
  endTime!: string;
  durationMinutes!: number;  // Computed
  status!: string;
  notes?: string;
  cancelReason?: string;
  createdAt!: string;
  updatedAt!: string;
}
```

---

### 3. Repository

#### AppointmentRepository (`infrastructure/repositories/appointment.repository.ts`)

**Métodos principales:**

```typescript
async create(data: CreateAppointmentDto): Promise<AppointmentEntity>
```
Crea cita con validación de conflicto de horarios

```typescript
async findAll(filters: {
  patientId?: string;
  dentistId?: string;
  clinicId?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  skip?: number;
  take?: number;
}): Promise<AppointmentEntity[]>
```
Filtra por múltiples criterios con paginación

```typescript
async findById(id: string): Promise<AppointmentEntity | null>
```
Obtiene cita completa con todas sus relaciones

```typescript
async checkConflict(
  dentistId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string
): Promise<boolean>
```
Verifica si hay solapamiento en horarios del dentista

```typescript
async findAvailableSlots(
  dentistId: string,
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  slotIntervalMinutes?: number
): Promise<DentistAvailability>
```
Calcula slots disponibles en un rango de fechas

```typescript
async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentEntity>
```
Actualiza cita con re-validación de conflictos

```typescript
async cancel(id: string, reason: string): Promise<AppointmentEntity>
```
Soft-cancel: `status = 'CANCELLED'` + guardar motivo

---

### 4. Use-Cases

#### CreateAppointmentUseCase
```typescript
async execute(dto: CreateAppointmentDto): Promise<AppointmentResponseDto>
```
**Lógica:**
1. Valida que paciente, dentista, servicio y clínica existan
2. Verifica que `startTime < endTime`
3. Verifica que `startTime` esté en el futuro
4. Verifica que no haya conflicto de horarios (solapamiento)
5. Valida horario laboral de la clínica (ej: 8:00 - 18:00)
6. Crea appointment con status = `SCHEDULED`
7. Retorna `AppointmentResponseDto`

**Validaciones:**
- ✅ startTime > ahora
- ✅ endTime > startTime
- ✅ Duración mínima 15 minutos, máxima 4 horas
- ✅ No solapamiento con otras citas del mismo dentista
- ✅ Horario dentro del horario laboral de la clínica

---

#### ListAppointmentsUseCase
```typescript
async execute(filters: ListAppointmentsInput): Promise<AppointmentResponseDto[]>
```
Input:
```typescript
{
  patientId?: string;
  dentistId?: string;
  clinicId?: string;
  status?: string;              // SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED
  dateFrom?: Date;
  dateTo?: Date;
  skip?: number;                // Default 0
  take?: number;                // Default 10
}
```
- ✅ Filtra por todos los criterios
- ✅ Ordena por `startTime` descendente (más recientes primero)
- ✅ Include: clinic, patient, dentist, service

---

#### GetAppointmentUseCase
```typescript
async execute(id: string): Promise<AppointmentResponseDto>
```
Retorna cita completa con todos los datos relacionados

---

#### UpdateAppointmentUseCase
```typescript
async execute(id: string, dto: UpdateAppointmentDto): Promise<AppointmentResponseDto>
```
- ✅ Lanza `NotFoundException` si no existe
- ✅ Si actualiza `startTime` o `endTime`, re-valida conflictos
- ✅ Si ya está COMPLETED, no permite cambios (except. status)
- ✅ Si está CANCELLED, no permite cambios

---

#### CancelAppointmentUseCase
```typescript
async execute(id: string, reason: string): Promise<AppointmentResponseDto>
```
- ✅ Lanza `NotFoundException` si no existe
- ✅ Lanza `BadRequestException` si ya está COMPLETED o CANCELLED
- ✅ Lanza `BadRequestException` si está a menos de 24 horas
- ✅ Cambia status a CANCELLED + guarda `cancelReason`

---

#### CheckDentistAvailabilityUseCase
```typescript
async execute(dto: CheckAvailabilityDto): Promise<DentistAvailability>
```
**Lógica:**
1. Obtiene todas las citas del dentista en el rango de fechas
2. Genera slots de 30 minutos (configurable)
3. Marca cada slot como disponible o no
4. Retorna array de TimeSlots con disponibilidades

---

### 5. AppointmentController

```typescript
@Controller('appointments')
@UseGuards(JwtGuard)
export class AppointmentController {
  @Post()
  @ApiOperation({ summary: 'Crear nueva cita' })
  async createAppointment(@Body() dto: CreateAppointmentDto): Promise<ApiResponse<AppointmentResponseDto>>
  
  @Get()
  @ApiOperation({ summary: 'Listar citas con filtros' })
  async listAppointments(
    @Query('patientId') patientId?: string,
    @Query('dentistId') dentistId?: string,
    @Query('clinicId') clinicId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<ApiResponse<AppointmentResponseDto[]>>
  
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de cita' })
  async getAppointment(@Param('id') id: string): Promise<ApiResponse<AppointmentResponseDto>>
  
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cita' })
  async updateAppointment(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<ApiResponse<AppointmentResponseDto>>
  
  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar cita' })
  async cancelAppointment(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ): Promise<ApiResponse<AppointmentResponseDto>>
  
  @Post('check-availability')
  @ApiOperation({ summary: 'Verificar disponibilidad de dentista' })
  async checkAvailability(@Body() dto: CheckAvailabilityDto): Promise<ApiResponse<DentistAvailability>>
}
```

**Endpoints Summary:**

| Método | Path | Descripción |
|--------|------|-------------|
| POST | `/appointments` | Crear cita |
| GET | `/appointments` | Listar con filtros |
| GET | `/appointments/:id` | Obtener detalle |
| PATCH | `/appointments/:id` | Actualizar cita |
| DELETE | `/appointments/:id` | Cancelar cita |
| POST | `/appointments/check-availability` | Verificar disponibilidad |

---

## 🎨 Implementación Frontend

### Estructura de Carpetas

```
frontend/src/features/appointment/
├── domain/
│   ├── Appointment.types.ts
│   ├── Appointment.request.ts
│   └── Appointment.response.ts
├── infrastructure/
│   └── api/
│       └── appointment.api.ts
├── application/
│   ├── appointment.service.ts
│   └── hooks/
│       ├── useAppointmentList.ts
│       ├── useAppointmentDetail.ts
│       ├── useDentistAvailability.ts
│       └── useAppointmentMutations.ts
└── presentation/
    ├── AppointmentsPage.tsx
    └── components/
        ├── AppointmentStatusBadge.tsx
        ├── AppointmentCard.tsx
        ├── AppointmentCalendar.tsx
        ├── AppointmentDetailDrawer.tsx
        ├── CreateAppointmentDrawer.tsx
        ├── DentistAvailability.tsx
        └── CancelAppointmentModal.tsx

Total: 18 archivos
```

---

### Domain Types

#### Appointment.types.ts
```typescript
export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string }> = {
  SCHEDULED:   { label: 'Programada',  color: 'blue'   },
  IN_PROGRESS: { label: 'En curso',    color: 'orange' },
  COMPLETED:   { label: 'Completada',  color: 'green'  },
  CANCELLED:   { label: 'Cancelada',   color: 'red'    },
};

export interface Appointment {
  id: string;
  clinicId: string;
  clinicName: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface DentistAvailability {
  dentistId: string;
  dentistName: string;
  date: string;
  slots: TimeSlot[];
}
```

---

### Components

#### AppointmentsPage — Página Principal

**Layout:**
```
┌─────────────────────────────────────┐
│ "Citas" [+ Nueva Cita]              │
├─────────────────────────────────────┤
│ Vista: [📅 Calendario] [📋 Lista]   │
├─────────────────────────────────────┤
│ Filtros: Dentista | Estado | Fecha  │
├─────────────────────────────────────┤
│ Contenido dinámico (Calendario/Lista)
└─────────────────────────────────────┘
```

**Features:**
- ✅ Toggle entre vista Calendario y Lista
- ✅ Calendario interactivo (Mantine Calendar)
- ✅ Filtros en tiempo real
- ✅ Gestiona estado de drawers/modals

---

#### AppointmentCalendar — Vista Calendario

```
┌─────────────────────────────┐
│     ◄ Abril 2026 ►         │
├─────────────────────────────┤
│ Lu  Ma  Mi  Ju  Vi  Sa  Do │
│  1   2   3   4   5   6   7 │
│  8   9  10  11  12  13  14 │
│ ...                         │
│ [Hoy: 19]  [Ir a hoy]      │
└─────────────────────────────┘
```

**Interactividad:**
- Click en fecha → muestra citas del día en un drawer o modal
- Cita en la fecha → pequeño badge con hora y paciente
- Color de fondo si hay citas (azul si SCHEDULED, naranja si IN_PROGRESS)

---

#### AppointmentCard — Tarjeta de Cita

```
┌──────────────────────────────┐
│ Dentista: Dr. García         │
│ [SCHEDULED]                  │
├──────────────────────────────┤
│ Juan Pérez García            │
│ Limpieza Dental              │
├──────────────────────────────┤
│ 📅 20/04/2026  ⏰ 10:00-11:00 │
│ 💰 $150.00                   │
└──────────────────────────────┘
```

**Interactividad:**
- Click → abre AppointmentDetailDrawer
- Hover → elevate con shadow

---

#### AppointmentDetailDrawer — Detalles Completos

**Secciones:**
1. **Header**: Dentista, paciente, badge de estado
2. **Información General**: Fechas, duración, servicio, precio
3. **Clínica**: Nombre y ubicación
4. **Notas**: Si existen
5. **Acciones**:
   - `[Editar]` (si SCHEDULED)
   - `[Iniciar Cita]` (si SCHEDULED y es hoy)
   - `[Completar]` (si IN_PROGRESS)
   - `[Cancelar]` (si SCHEDULED y > 24h)

---

#### CreateAppointmentDrawer — Crear Cita

**Flujo:**
```
Paso 1: Seleccionar Paciente
  [Select paciente]

Paso 2: Seleccionar Dentista
  [Select dentista] → carga disponibilidad

Paso 3: Seleccionar Slot
  [Calendar + TimeSlots] → muestra slots disponibles
  
Paso 4: Detalles
  Servicio: [Select]
  Notas: [Textarea]
  [Cancelar] [Crear Cita]
```

**Features:**
- ✅ Auto-carga slots disponibles al seleccionar dentista + fecha
- ✅ Solo permite seleccionar slots disponibles
- ✅ Muestra duración del servicio automáticamente
- ✅ Validación cliente: no permitir fecha pasada

---

#### DentistAvailability — Disponibilidad Visual

```
Dr. García - 20/04/2026
┌───────────────────────────┐
│ 08:00-08:30 ✓ Disponible  │
│ 08:30-09:00 ✓ Disponible  │
│ 09:00-09:30 ✗ Ocupado     │
│ 09:30-10:00 ✓ Disponible  │
│ 10:00-10:30 ✓ Disponible  │
│ ...                       │
└───────────────────────────┘
```

**Interactividad:**
- Click en slot disponible → selecciona para crear cita
- Disabled si no está disponible (gris)

---

#### CancelAppointmentModal — Cancelar Cita

```
"Cancelar Cita"
¿Estás seguro de que deseas cancelar 
esta cita del Dr. García con Juan Pérez?

Motivo de cancelación: [Textarea]
  (Paciente enfermo, cambio de horario, etc)

[Mantener] [Cancelar Cita]
```

---

### Hooks

#### useAppointmentList
```typescript
const { appointments, isLoading, error, stats } = useAppointmentList({
  dateFrom?: Date,
  dateTo?: Date,
  dentistId?: string,
  status?: AppointmentStatus
})
```
- ✅ useQuery con caching
- ✅ Calcula stats: total, scheduled, in_progress, completed
- ✅ Paginación automática

#### useDentistAvailability
```typescript
const { availability, isLoading } = useDentistAvailability({
  dentistId: string,
  startDate: Date,
  endDate: Date,
  durationMinutes: number
})
```

#### useAppointmentMutations
```typescript
const {
  create, createLoading,
  update, updateLoading,
  cancel, cancelLoading,
} = useAppointmentMutations()
```

---

## 🧪 Ejemplos de Uso

### 1. Crear Cita

**Request:**
```http
POST /appointments
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "patientId": "patient-123",
  "dentistId": "dentist-456",
  "serviceId": "service-789",
  "clinicId": "clinic-001",
  "startTime": "2026-04-20T10:00:00Z",
  "endTime": "2026-04-20T11:00:00Z",
  "notes": "Paciente llega 10 minutos antes"
}
```

**Response (201):**
```json
{
  "id": "appt-uuid-001",
  "clinicId": "clinic-001",
  "clinicName": "Clínica Central",
  "patientId": "patient-123",
  "patientName": "Juan Pérez García",
  "dentistId": "dentist-456",
  "dentistName": "Dr. Carlos García",
  "serviceId": "service-789",
  "serviceName": "Limpieza Dental",
  "servicePrice": 150,
  "startTime": "2026-04-20T10:00:00.000Z",
  "endTime": "2026-04-20T11:00:00.000Z",
  "durationMinutes": 60,
  "status": "SCHEDULED",
  "notes": "Paciente llega 10 minutos antes",
  "cancelReason": null,
  "createdAt": "2026-04-19T12:00:00.000Z",
  "updatedAt": "2026-04-19T12:00:00.000Z"
}
```

---

### 2. Verificar Disponibilidad

**Request:**
```http
POST /appointments/check-availability
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "dentistId": "dentist-456",
  "startDate": "2026-04-20T00:00:00Z",
  "endDate": "2026-04-20T23:59:59Z",
  "durationMinutes": 60
}
```

**Response (200):**
```json
{
  "dentistId": "dentist-456",
  "dentistName": "Dr. Carlos García",
  "date": "2026-04-20",
  "slots": [
    {
      "startTime": "2026-04-20T08:00:00.000Z",
      "endTime": "2026-04-20T09:00:00.000Z",
      "isAvailable": true
    },
    {
      "startTime": "2026-04-20T09:00:00.000Z",
      "endTime": "2026-04-20T10:00:00.000Z",
      "isAvailable": false,
      "reason": "Cita programada"
    },
    {
      "startTime": "2026-04-20T10:00:00.000Z",
      "endTime": "2026-04-20T11:00:00.000Z",
      "isAvailable": true
    }
  ]
}
```

---

### 3. Cancelar Cita

**Request:**
```http
DELETE /appointments/appt-uuid-001
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "reason": "Paciente canceló, está enfermo"
}
```

**Response (200):**
```json
{
  "id": "appt-uuid-001",
  "status": "CANCELLED",
  "cancelReason": "Paciente canceló, está enfermo",
  "updatedAt": "2026-04-19T13:00:00.000Z"
}
```

---

## ✅ Validaciones de Negocio

| Regla | Endpoint | Implementación | Error |
|-------|----------|----------------|-------|
| Paciente existe | POST | Validación en use-case | 404 - Not Found |
| Dentista existe | POST | Validación en use-case | 404 - Not Found |
| Servicio existe | POST | Validación en use-case | 404 - Not Found |
| Clínica existe | POST | Validación en use-case | 404 - Not Found |
| startTime < endTime | POST | Validación en DTO | 400 - Validation |
| startTime > ahora | POST | Validación en use-case | 400 - Bad Request |
| No solapamiento | POST | `checkConflict()` | 400 - Conflict |
| Horario laboral | POST | Validación en use-case | 400 - Bad Request |
| Duración 15-240 min | POST | Validación en use-case | 400 - Bad Request |
| No cancelar COMPLETED | DELETE | Validación en use-case | 400 - Bad Request |
| Cancelar si > 24h | DELETE | Validación en use-case | 400 - Bad Request |

---

## 📊 Seed Data

Se agregó citas de prueba en `prisma/seed.ts`:

```typescript
const appointment = await prisma.appointment.upsert({
  where: { id: 'appointment-sample-001' },
  create: {
    id: 'appointment-sample-001',
    clinicId: clinic.id,
    patientId: patient.id,
    dentistId: dentist.id,
    serviceId: service.id,
    startTime: new Date('2026-04-20T10:00:00'),
    endTime: new Date('2026-04-20T11:00:00'),
    status: 'SCHEDULED',
    notes: 'Cita de limpieza dental preventiva',
  },
});
```

---

## 🔍 Testing Manual

### 1. Verificar compilación TypeScript

**Backend:**
```bash
cd backend
npx tsc -b --noEmit
```

**Frontend:**
```bash
cd frontend
npx tsc -b --noEmit
```

---

### 2. Probar endpoints REST

#### Crear cita
```bash
TOKEN="<jwt_aqui>"

curl -X POST http://localhost:3000/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "patientId":"<patient-id>",
    "dentistId":"<dentist-id>",
    "serviceId":"<service-id>",
    "clinicId":"<clinic-id>",
    "startTime":"2026-04-20T10:00:00Z",
    "endTime":"2026-04-20T11:00:00Z"
  }'
```

#### Verificar disponibilidad
```bash
curl -X POST http://localhost:3000/appointments/check-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "dentistId":"<dentist-id>",
    "startDate":"2026-04-20T00:00:00Z",
    "endDate":"2026-04-20T23:59:59Z",
    "durationMinutes":60
  }'
```

#### Listar citas
```bash
curl -X GET "http://localhost:3000/appointments?status=SCHEDULED&dateFrom=2026-04-20&dateTo=2026-04-30" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Verificar Frontend

1. **Navegación**: Login → Backoffice → Citas → ver página
2. **Crear cita**: [+ Nueva Cita] → seleccionar paciente → dentista → slot → confirmar
3. **Ver disponibilidad**: Seleccionar dentista → muestra slots disponibles
4. **Cancelar cita**: Click en cita → [Cancelar] → ingresa motivo
5. **Cambiar vista**: Toggle Calendario ↔ Lista
6. **Verificar estado**: Estado actualiza en tiempo real con badge de color

---

## 📚 Referencia de Arquitectura

### DDD Layers

```
Domain Layer
  ├─ AppointmentEntity
  └─ AvailabilityValueObject

Application Layer
  ├─ DTOs (Create/Update/Response)
  ├─ Use-cases (6 comandos)
  └─ Repository (abstracción)

Infrastructure Layer
  ├─ Prisma (ORM)
  └─ AppointmentRepository (implementación)

Presentation Layer
  └─ AppointmentController (6 endpoints)
```

### Patrones Aplicados

- ✅ Use-case pattern
- ✅ Repository pattern
- ✅ DTO pattern
- ✅ Value Objects (TimeSlot, Availability)
- ✅ Conflict detection (solapamiento de horarios)
- ✅ Fluent validation (class-validator)
- ✅ Exception handling (NestJS exceptions)

### Frontend Patterns

- ✅ Custom hooks (useAppointmentList, useDentistAvailability)
- ✅ React Query (useQuery, useMutation)
- ✅ Calendar component (Mantine Calendar)
- ✅ Real-time availability checking
- ✅ Spanish localization

---

## ✨ Estado Final

**Implementación: ✅ COMPLETADA**

**Backend (16 archivos):**
- ✅ 2 Domain entities + value objects
- ✅ 4 DTOs con validación
- ✅ 6 Use-cases
- ✅ Repository pattern
- ✅ 6 endpoints REST
- ✅ Conflict detection
- ✅ Availability checking
- ✅ TypeScript sin errores

**Frontend (18 archivos):**
- ✅ 3 Domain types
- ✅ API client
- ✅ 4 Custom hooks
- ✅ 7 Componentes React
- ✅ AppointmentsPage principal
- ✅ Calendario interactivo
- ✅ Drawers y modals
- ✅ Real-time availability
- ✅ Spanish localization
- ✅ TypeScript sin errores

**Features:**
- ✅ Creación con validación de conflictos
- ✅ Búsqueda de disponibilidad
- ✅ Vista calendario interactiva
- ✅ Gestión de estados completa
- ✅ Cancelación con motivo
- ✅ Filtros por múltiples criterios
- ✅ UI sofisticada en español

**Próximo**: SERVICES_MANAGEMENT_IMPLEMENTATION.md o USERS_MANAGEMENT_IMPLEMENTATION.md

---

## 🔗 Referencias

**Archivos del módulo:**
- Backend: `backend/src/appointment/`
- Frontend: `frontend/src/features/appointment/`

**Rutas integradas:**
- Backend: `backend/src/app.module.ts`
- Frontend: `frontend/src/features/backoffice/router/routes.tsx` (appointmentRoute)

**Seed data:** `backend/prisma/seed.ts`

**Modelos Prisma:** `backend/prisma/schema.prisma`

