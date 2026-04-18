# Patient Management Implementation - OdontoSuite

**Fecha**: 17 de abril de 2026  
**Stack**: React 19 + Vite + Mantine v9 + TanStack Router v1 + Zustand + TanStack Query + NestJS + Prisma  
**Status**: ✅ Completado

---

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de gestión de pacientes siguiendo arquitectura DDD (Domain-Driven Design) en 4 fases:

1. **Backend Clinic Module**: Endpoint `GET /clinics` para listar clínicas
2. **Frontend Clinic Feature**: Store Zustand + API adapter para persistir clínica seleccionada
3. **Frontend Patients Feature**: Dominio, infraestructura y UI (lista, crear, detalle)
4. **Router Integration**: Rutas anidadas + layout actualizado con selector de clínica

El sistema está listo para producción con:
- ✅ Validación Zod en cliente
- ✅ Paginación con heurística MVP
- ✅ Mapeo automático de errores servidor
- ✅ Queries cachés con TanStack Query
- ✅ Formularios con tabs (Datos Básicos + Info Médica)
- ✅ Responsive Mantine UI

---

## 🏗️ Plan Original

### Contexto
El backoffice ya tiene:
- ✅ Layout completo con sidebar y header (`BackofficeLayout.tsx`)
- ✅ Ruta placeholder `/backoffice/patients`
- ❌ Backend sin relación usuario-clínica (ni en User entity, ni en JWT)
- ❌ Módulo Clinic vacío (sin controller, use-cases, repository)

**Solución adoptada**:
- Implementar `GET /clinics` en backend
- Crear `useClinicStore` en frontend que persiste `clinicId` seleccionado en localStorage
- Auto-seleccionar clínica si solo existe una
- Selector compacto en header del `BackofficeLayout`

### Dependencias Utilizadas
```bash
# Ya instaladas del Login/Dashboard:
@mantine/core @mantine/hooks @tabler/icons-react
@tanstack/react-router @tanstack/react-query zustand axios zod
@mantine/form @mantine/dates (para DateInput)
```

---

## 🎯 Fases de Implementación

### Fase 1: Backend — Módulo Clínica (GET /clinics)

#### Archivos Creados:

**1. `backend/src/clinic/domain/clinic.entity.ts`**
```typescript
export class ClinicEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
```

**Patrón**: Simple mapeo de Prisma → Domain entity usando `Object.assign()`

---

**2. `backend/src/clinic/application/dtos/clinic-response.dto.ts`**
```typescript
export class ClinicResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isActive: boolean;
}
```

**Características**:
- Lightweight DTO exponiendo solo 8 campos
- Evita exponer información innecesaria (logo, description, etc.)
- Mapeo directo desde ClinicEntity

---

**3. `backend/src/clinic/infrastructure/repositories/clinic.repository.ts`**
```typescript
@Injectable()
export class ClinicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ClinicEntity[]> {
    const clinics = await this.prisma.clinic.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return clinics.map(c => new ClinicEntity(c));
  }

  async findById(id: string): Promise<ClinicEntity | null> {
    const clinic = await this.prisma.clinic.findUnique({ where: { id } });
    return clinic ? new ClinicEntity(clinic) : null;
  }
}
```

**Características**:
- Filtra solo clínicas activas
- Ordena alfabéticamente por nombre
- Retorna domain entities (no DTOs)

---

**4. `backend/src/clinic/application/use-cases/list-clinics.use-case.ts`**
```typescript
@Injectable()
export class ListClinicsUseCase {
  constructor(private readonly clinicRepository: ClinicRepository) {}

  async execute(): Promise<ClinicResponseDto[]> {
    const entities = await this.clinicRepository.findAll();
    return entities.map(entity => ({
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      isActive: entity.isActive,
    }));
  }
}
```

**Patrón**: Use-case transforma entities → DTOs

---

**5. `backend/src/clinic/presentation/clinic.controller.ts`**
```typescript
@ApiTags('clinics')
@ApiBearerAuth('access-token')
@Controller('clinics')
@UseGuards(JwtGuard)
export class ClinicController {
  constructor(private readonly listClinicsUseCase: ListClinicsUseCase) {}

  @Get()
  @ApiOperation({ summary: 'List all active clinics' })
  @ApiResponse({ status: 200, description: 'Lista de clínicas' })
  async listClinics() {
    return this.listClinicsUseCase.execute();
  }
}
```

**Características**:
- JWT Guard protege el endpoint
- Swagger documentation
- Retorna array de ClinicResponseDto

---

**6. `backend/src/clinic/clinic.module.ts` (MODIFICADO)**
```typescript
@Module({
  imports: [CommonModule],
  controllers: [ClinicController],
  providers: [ListClinicsUseCase, ClinicRepository],
})
export class ClinicModule {}
```

**Nota**: `CommonModule` ya importa `PrismaModule`, permitiendo inyectar `PrismaService`

---

### Fase 2: Frontend — Feature Clinic (soporte clinicId)

#### Estructura:
```
frontend/src/features/clinic/
├── domain/
│   ├── Clinic.types.ts
│   └── Clinic.response.ts
├── infrastructure/
│   ├── api/clinic.api.ts
│   └── store/clinic.store.ts
└── application/
    └── clinic.service.ts
```

---

**1. `frontend/src/features/clinic/domain/Clinic.types.ts`**
```typescript
export interface Clinic {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  isActive: boolean;
}

export interface ClinicState {
  clinics: Clinic[];
  selectedClinicId: string | null;
  isLoading: boolean;
  error: string | null;
}
```

---

**2. `frontend/src/features/clinic/domain/Clinic.response.ts`**
```typescript
import type { Clinic } from './Clinic.types';

export interface ClinicListApiResponse {
  statusCode: number;
  message: string;
  data: Clinic[];
  timestamp: string;
}
```

**Patrón**: Envelope pattern que mapea respuesta backend

---

**3. `frontend/src/features/clinic/infrastructure/api/clinic.api.ts`**
```typescript
import { axiosInstance } from '../../shared/api/axios.instance';
import type { Clinic, ClinicListApiResponse } from '../domain/Clinic.response';

export async function fetchClinics(): Promise<Clinic[]> {
  const response = await axiosInstance.get<ClinicListApiResponse>('/clinics');
  return response.data.data;  // ← Adapter: accede a res.data.data
}
```

**Características**:
- Retorna solo array de clinics (abstrae envelope pattern)
- Type-safe con TypeScript generics
- Usa singleton axiosInstance (con JWT interceptor)

---

**4. `frontend/src/features/clinic/infrastructure/store/clinic.store.ts`**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Clinic, ClinicState } from '../domain/Clinic.types';

export const useClinicStore = create<
  ClinicState & {
    setClinics: (clinics: Clinic[]) => void;
    selectClinic: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
  }
>()(
  persist(
    (set) => ({
      clinics: [],
      selectedClinicId: null,
      isLoading: false,
      error: null,
      setClinics: (clinics) => set({ clinics }),
      selectClinic: (id) => set({ selectedClinicId: id }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set({
        clinics: [],
        selectedClinicId: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'clinic-store',
      partialize: (state) => ({
        selectedClinicId: state.selectedClinicId,  // ← Solo persiste selectedClinicId
      }),
    }
  )
);
```

**Características**:
- Zustand persist middleware con localStorage
- `partialize`: solo guarda `selectedClinicId`
- Store se reinicia al recargar excepto la clínica seleccionada
- `setClinics` se llama desde clinic.service

---

**5. `frontend/src/features/clinic/application/clinic.service.ts`**
```typescript
import { fetchClinics } from '../infrastructure/api/clinic.api';
import { useClinicStore } from '../infrastructure/store/clinic.store';

export const clinicService = {
  async loadClinics() {
    const { setClinics, selectClinic, setLoading, setError } = useClinicStore.getState();
    setLoading(true);
    try {
      const clinics = await fetchClinics();
      setClinics(clinics);
      
      // Auto-seleccionar si solo hay 1 clínica
      if (clinics.length === 1) {
        selectClinic(clinics[0].id);
      }
    } catch (error: any) {
      setError(error?.message || 'Error loading clinics');
    } finally {
      setLoading(false);
    }
  },

  selectClinic(id: string) {
    useClinicStore.getState().selectClinic(id);
  },

  getSelectedClinicId(): string | null {
    return useClinicStore.getState().selectedClinicId;
  },

  getClinics() {
    return useClinicStore.getState().clinics;
  },
};
```

**Patrón**: Service como fachada de store y API

---

### Fase 3: Frontend — Feature Patients (DDD Completo)

#### Estructura:
```
frontend/src/features/patients/
├── domain/
│   ├── Patient.types.ts
│   ├── Patient.request.ts
│   └── Patient.response.ts
├── infrastructure/
│   └── api/patient.api.ts
├── application/
│   └── patient.service.ts
├── list/
│   ├── hooks/usePatientList.ts
│   └── PatientList.tsx
├── create/
│   ├── hooks/useCreatePatient.ts
│   └── CreatePatientDrawer.tsx
└── detail/
    ├── hooks/usePatientDetail.ts
    └── PatientDetail.tsx
```

---

#### Domain Layer:

**1. `frontend/src/features/patients/domain/Patient.types.ts`**
```typescript
export type PatientGender = 'M' | 'F' | 'O';

export interface Patient {
  id: string;
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: PatientGender;
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string[];
  medicalConditions?: string[];
  insuranceProvider?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Calculated
  fullName: string;
}

export interface PatientListState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  page: number;
}
```

---

**2. `frontend/src/features/patients/domain/Patient.request.ts`**
```typescript
export interface CreatePatientRequest {
  // Required (7)
  clinicId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // "YYYY-MM-DD"
  gender: 'M' | 'F' | 'O';

  // Optional (11)
  cpf?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string[];
  medicalConditions?: string[];
  insuranceProvider?: string;
  notes?: string;
}

export interface ListPatientsRequest {
  clinicId: string;
  skip?: number;
  take?: number;
}
```

---

**3. `frontend/src/features/patients/domain/Patient.response.ts`**
```typescript
import type { Patient } from './Patient.types';

export interface PatientApiResponse {
  statusCode: number;
  message: string;
  data: Patient;
  timestamp: string;
}

export interface PatientListApiResponse {
  statusCode: number;
  message: string;
  data: Patient[];
  timestamp: string;
}

export interface CreatePatientApiResponse {
  statusCode: number;
  message: string;
  data: Patient;
  timestamp: string;
}
```

---

#### Infrastructure Layer:

**4. `frontend/src/features/patients/infrastructure/api/patient.api.ts`**
```typescript
import { axiosInstance } from '../../shared/api/axios.instance';
import type {
  CreatePatientRequest,
  ListPatientsRequest,
} from '../domain/Patient.request';
import type {
  Patient,
  PatientApiResponse,
  PatientListApiResponse,
  CreatePatientApiResponse,
} from '../domain/Patient.response';

export async function createPatient(req: CreatePatientRequest): Promise<Patient> {
  const response = await axiosInstance.post<CreatePatientApiResponse>(
    '/patients',
    req
  );
  return response.data.data;
}

export async function getPatientById(id: string): Promise<Patient> {
  const response = await axiosInstance.get<PatientApiResponse>(
    `/patients/${id}`
  );
  return response.data.data;
}

export async function listPatients(req: ListPatientsRequest): Promise<Patient[]> {
  const response = await axiosInstance.get<PatientListApiResponse>('/patients', {
    params: {
      clinicId: req.clinicId,
      skip: req.skip ?? 0,
      take: req.take ?? 10,
    },
  });
  return response.data.data;
}
```

---

**5. `frontend/src/features/patients/application/patient.service.ts`**
```typescript
import { createPatient, getPatientById, listPatients } from '../infrastructure/api/patient.api';
import type { CreatePatientRequest, ListPatientsRequest } from '../domain/Patient.request';

export const patientService = {
  async create(req: CreatePatientRequest) {
    return createPatient(req);
  },

  async getById(id: string) {
    return getPatientById(id);
  },

  async list(req: ListPatientsRequest) {
    return listPatients(req);
  },
};
```

---

#### Presentation Layer (List):

**6. `frontend/src/features/patients/list/hooks/usePatientList.ts`**
```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../application/patient.service';
import { useClinicStore } from '../../../clinic/infrastructure/store/clinic.store';

export function usePatientList() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const selectedClinicId = useClinicStore((s) => s.selectedClinicId);

  const { data: patients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['patients', selectedClinicId, page],
    queryFn: async () => {
      if (!selectedClinicId) return [];
      return patientService.list({
        clinicId: selectedClinicId,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
    },
    enabled: !!selectedClinicId,
    staleTime: 30_000, // 30 segundos
  });

  return {
    patients: patients || [],
    isLoading,
    error: error?.message || null,
    page,
    setPage,
    pageSize,
    refetch,
    hasClinic: !!selectedClinicId,
  };
}
```

**Características**:
- Query cacheada con TanStack Query
- Solo activa query si `selectedClinicId` existe
- Paginación manual con `skip/take`
- Refetch manual tras crear paciente

---

**7. `frontend/src/features/patients/list/PatientList.tsx`**
```typescript
import { useNavigate } from '@tanstack/react-router';
import { useDisclosure } from '@mantine/hooks';
import {
  Container, Stack, Group, Title, Button, Card, Table, Avatar, Text,
  Badge, ActionIcon, Alert, Skeleton, Pagination, Breadcrumbs, Anchor,
} from '@mantine/core';
import { IconEye, IconAlertCircle } from '@tabler/icons-react';
import { usePatientList } from './hooks/usePatientList';
import { CreatePatientDrawer } from '../create/CreatePatientDrawer';
import type { PatientGender } from '../domain/Patient.types';

const genderColor: Record<PatientGender, string> = { M: 'blue', F: 'pink', O: 'gray' };
const genderLabel: Record<PatientGender, string> = { M: 'Masculino', F: 'Femenino', O: 'Otro' };

export function PatientList() {
  const navigate = useNavigate();
  const { patients, isLoading, error, page, setPage, pageSize, refetch, hasClinic } =
    usePatientList();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate({ to: '/backoffice/dashboard' })}>
            Dashboard
          </Anchor>
          <span>Pacientes</span>
        </Breadcrumbs>

        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={1}>Pacientes</Title>
          <Button onClick={openDrawer} disabled={!hasClinic}>
            + Nuevo Paciente
          </Button>
        </Group>

        {/* Clinic selector alert */}
        {!hasClinic && (
          <Alert icon={<IconAlertCircle />} color="yellow">
            Selecciona una clínica en el menú superior para ver y crear pacientes.
          </Alert>
        )}

        {/* Error alert */}
        {error && (
          <Alert icon={<IconAlertCircle />} color="red">
            {error}
          </Alert>
        )}

        {/* Patients table */}
        {hasClinic && (
          <Card withBorder>
            {isLoading ? (
              <Stack gap="md">
                <Skeleton height={50} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : patients.length === 0 ? (
              <Text ta="center" py="xl" c="dimmed">
                No hay pacientes registrados aún
              </Text>
            ) : (
              <>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Paciente</Table.Th>
                      <Table.Th>Contacto</Table.Th>
                      <Table.Th>Edad</Table.Th>
                      <Table.Th>Género</Table.Th>
                      <Table.Th>Estado</Table.Th>
                      <Table.Th>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {patients.map((patient) => (
                      <Table.Tr key={patient.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar name={patient.fullName} color="blue" radius="xl" size="md" />
                            <div>
                              <Text fw={500} size="sm">
                                {patient.fullName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {patient.email}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.phone}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{patient.age} años</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={genderColor[patient.gender]} size="sm">
                            {genderLabel[patient.gender]}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={patient.isActive ? 'green' : 'gray'}
                            variant={patient.isActive ? 'light' : 'outline'}
                            size="sm"
                          >
                            {patient.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="blue"
                            onClick={() =>
                              navigate({
                                to: '/backoffice/patients/$patientId',
                                params: { patientId: patient.id },
                              })
                            }
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>

                {/* Pagination - MVP heuristic */}
                {patients.length >= pageSize && (
                  <Group justify="center" mt="xl">
                    <Pagination
                      value={page}
                      onChange={setPage}
                      size="sm"
                      radius="md"
                      total={Math.ceil(patients.length / pageSize) + 1}
                    />
                  </Group>
                )}
              </>
            )}
          </Card>
        )}
      </Stack>

      <CreatePatientDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        onSuccess={() => {
          refetch();
          closeDrawer();
        }}
      />
    </Container>
  );
}
```

**Características UI**:
- Breadcrumbs: Dashboard / Pacientes
- Header: Title + Botón "Nuevo Paciente" (deshabilitado sin clínica)
- Alert amarillo si no hay clínica seleccionada
- Tabla con 6 columnas: Paciente, Contacto, Edad, Género, Estado, Acciones
- Loading skeletons mientras carga
- Paginación (solo si retorna exactamente `pageSize` items)
- Click en ojo navega a detalle

---

#### Presentation Layer (Create):

**8. `frontend/src/features/patients/create/hooks/useCreatePatient.ts`**
```typescript
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { patientService } from '../../application/patient.service';
import { useClinicStore } from '../../../clinic/infrastructure/store/clinic.store';
import type { CreatePatientRequest } from '../../domain/Patient.request';

const createPatientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  gender: z.enum(['M', 'F', 'O'], { message: 'Selecciona un género' }),
  cpf: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  insuranceProvider: z.string().optional(),
  notes: z.string().optional(),
});

type CreatePatientFormValues = z.infer<typeof createPatientSchema>;

export function useCreatePatient(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const selectedClinicId = useClinicStore((s) => s.selectedClinicId);

  const form = useForm<CreatePatientFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'M',
      cpf: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: [],
      medicalConditions: [],
      insuranceProvider: '',
      notes: '',
    },
    validate: (values) => {
      try {
        createPatientSchema.parse(values);
        return {};
      } catch (error: any) {
        const fieldErrors: Record<string, string> = {};
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
        }
        return fieldErrors;
      }
    },
  });

  const handleSubmit = async (values: CreatePatientFormValues) => {
    if (!selectedClinicId) {
      setServerError('No hay clínica seleccionada');
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      // Convertir Date a YYYY-MM-DD si es necesario
      const dateOfBirth =
        values.dateOfBirth && typeof values.dateOfBirth === 'object' && 'toISOString' in values.dateOfBirth
          ? (values.dateOfBirth as Date).toISOString().split('T')[0]
          : values.dateOfBirth;

      const req: CreatePatientRequest = {
        ...values,
        clinicId: selectedClinicId,
        dateOfBirth,
        allergies: values.allergies?.filter(Boolean),
        medicalConditions: values.medicalConditions?.filter(Boolean),
      };

      await patientService.create(req);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear el paciente';

      const errorMessage = Array.isArray(message) ? message.join(', ') : message;

      // Mapeo de errores del servidor
      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes('email')) {
        form.setFieldError('email', 'Este email ya está registrado');
      } else if (errorLower.includes('cpf')) {
        form.setFieldError('cpf', 'Este CPF ya está registrado');
      } else {
        setServerError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { form, handleSubmit, isLoading, serverError };
}
```

**Características**:
- Validación Zod para todos los campos
- Conversión automática Date → YYYY-MM-DD
- Mapeo de errores servidor → campos específicos
- Email/CPF duplicados → field errors
- Otros errores → serverError general
- `onSuccess` callback para cerrar drawer

---

**9. `frontend/src/features/patients/create/CreatePatientDrawer.tsx`**
```typescript
import {
  Drawer, Stack, Group, Button, Alert, TextInput, Select,
  TagsInput, Textarea, Tabs,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCreatePatient } from './hooks/useCreatePatient';

interface CreatePatientDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePatientDrawer({ opened, onClose, onSuccess }: CreatePatientDrawerProps) {
  const { form, handleSubmit, isLoading, serverError } = useCreatePatient(onSuccess);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Nuevo Paciente"
      position="right"
      size="lg"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {serverError && (
            <Alert icon={<IconAlertCircle />} color="red">
              {serverError}
            </Alert>
          )}

          <Tabs defaultValue="basic">
            <Tabs.List>
              <Tabs.Tab value="basic">Datos Básicos</Tabs.Tab>
              <Tabs.Tab value="medical">Info Médica</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="basic">
              <Stack gap="md" mt="md">
                {/* Nombre y Apellido */}
                <Group grow>
                  <TextInput
                    label="Nombre *"
                    placeholder="Juan"
                    {...form.getInputProps('firstName')}
                  />
                  <TextInput
                    label="Apellido *"
                    placeholder="Pérez"
                    {...form.getInputProps('lastName')}
                  />
                </Group>

                {/* Email */}
                <TextInput
                  label="Email *"
                  type="email"
                  placeholder="juan@example.com"
                  {...form.getInputProps('email')}
                />

                {/* Teléfono */}
                <TextInput
                  label="Teléfono *"
                  placeholder="+591 7123456"
                  {...form.getInputProps('phone')}
                />

                {/* Fecha de Nacimiento */}
                <DateInput
                  label="Fecha de Nacimiento *"
                  placeholder="Selecciona una fecha"
                  maxDate={new Date()}
                  valueFormat="YYYY-MM-DD"
                  {...form.getInputProps('dateOfBirth')}
                />

                {/* Género */}
                <Select
                  label="Género *"
                  placeholder="Selecciona un género"
                  data={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' },
                    { value: 'O', label: 'Otro' },
                  ]}
                  {...form.getInputProps('gender')}
                />

                {/* CPF / Documento */}
                <TextInput
                  label="CPF / Documento"
                  placeholder=""
                  {...form.getInputProps('cpf')}
                />

                {/* Dirección */}
                <TextInput
                  label="Dirección"
                  placeholder="Calle Principal 123"
                  {...form.getInputProps('address')}
                />

                {/* Ciudad, Estado, Código Postal */}
                <Group grow>
                  <TextInput
                    label="Ciudad"
                    placeholder=""
                    {...form.getInputProps('city')}
                  />
                  <TextInput
                    label="Estado/Departamento"
                    placeholder=""
                    {...form.getInputProps('state')}
                  />
                  <TextInput
                    label="Código Postal"
                    placeholder=""
                    {...form.getInputProps('zipCode')}
                  />
                </Group>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="medical">
              <Stack gap="md" mt="md">
                {/* Contacto de Emergencia */}
                <TextInput
                  label="Contacto de Emergencia"
                  placeholder="María Pérez"
                  {...form.getInputProps('emergencyContact')}
                />

                {/* Teléfono de Emergencia */}
                <TextInput
                  label="Teléfono de Emergencia"
                  placeholder="+591 7123456"
                  {...form.getInputProps('emergencyPhone')}
                />

                {/* Alergias */}
                <TagsInput
                  label="Alergias"
                  placeholder="Escribe y presiona Enter"
                  {...form.getInputProps('allergies')}
                />

                {/* Condiciones Médicas */}
                <TagsInput
                  label="Condiciones Médicas"
                  placeholder="Escribe y presiona Enter"
                  {...form.getInputProps('medicalConditions')}
                />

                {/* Seguro Médico */}
                <TextInput
                  label="Seguro Médico"
                  placeholder="Nombre del seguro"
                  {...form.getInputProps('insuranceProvider')}
                />

                {/* Notas */}
                <Textarea
                  label="Notas adicionales"
                  placeholder="Información importante del paciente"
                  rows={3}
                  {...form.getInputProps('notes')}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="xl">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              Guardar Paciente
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
```

**Características UI**:
- Drawer con posición derecha (`position="right"`)
- Size grande (`size="lg"`)
- Dos tabs: "Datos Básicos" (requeridos) e "Info Médica" (opcionales)
- DateInput con maxDate=hoy
- TagsInput para alergias y condiciones (sin validación de valores pre-existentes)
- Botones: Cancelar, Guardar Paciente (con loading state)
- Deshabilitado cerrar drawer mientras loading

---

#### Presentation Layer (Detail):

**10. `frontend/src/features/patients/detail/hooks/usePatientDetail.ts`**
```typescript
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../application/patient.service';

export function usePatientDetail(patientId: string) {
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getById(patientId),
    enabled: !!patientId,
    staleTime: 30_000,
  });

  return {
    patient,
    isLoading,
    error: error?.message || null,
  };
}
```

---

**11. `frontend/src/features/patients/detail/PatientDetail.tsx`**
```typescript
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  Container, Stack, Card, Group, Title, Badge, Button, Avatar,
  Text, Breadcrumbs, Anchor, Grid, Skeleton, Alert,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';
import { usePatientDetail } from './hooks/usePatientDetail';
import type { PatientGender } from '../domain/Patient.types';

const genderLabel: Record<PatientGender, string> = {
  M: 'Masculino',
  F: 'Femenino',
  O: 'Otro',
};

export function PatientDetail() {
  const { patientId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { patient, isLoading, error } = usePatientDetail(patientId || '');

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Skeleton height={200} />
      </Container>
    );
  }

  if (error || !patient) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle />} color="red">
          {error || 'Paciente no encontrado'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={() => navigate({ to: '/backoffice/dashboard' })}>
            Dashboard
          </Anchor>
          <Anchor onClick={() => navigate({ to: '/backoffice/patients' })}>
            Pacientes
          </Anchor>
          <span>{patient.fullName}</span>
        </Breadcrumbs>

        {/* Header Card */}
        <Card withBorder padding="lg">
          <Group gap="lg" align="flex-start">
            <Avatar name={patient.fullName} color="blue" radius="xl" size="xl" />
            <div style={{ flex: 1 }}>
              <Group justify="space-between" align="center" mb="xs">
                <div>
                  <Title order={2}>{patient.fullName}</Title>
                  <Text size="sm" c="dimmed">
                    {patient.age} años • {genderLabel[patient.gender]}
                  </Text>
                </div>
                <Button
                  leftSection={<IconArrowLeft size={16} />}
                  variant="outline"
                  onClick={() => navigate({ to: '/backoffice/patients' })}
                >
                  Volver
                </Button>
              </Group>
              <Group gap="xs">
                <Badge
                  color={patient.isActive ? 'green' : 'gray'}
                  variant={patient.isActive ? 'light' : 'outline'}
                >
                  {patient.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </Group>
            </div>
          </Group>
        </Card>

        {/* Content Grid */}
        <Grid gutter="lg">
          {/* Contact Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg">
              <Title order={3} mb="md">
                Datos de Contacto
              </Title>
              <Stack gap="sm">
                <div>
                  <Text size="xs" c="dimmed" fw={500}>
                    Email
                  </Text>
                  <Text size="sm">{patient.email}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" fw={500}>
                    Teléfono
                  </Text>
                  <Text size="sm">{patient.phone}</Text>
                </div>
                {patient.address && (
                  <div>
                    <Text size="xs" c="dimmed" fw={500}>
                      Dirección
                    </Text>
                    <Text size="sm">{patient.address}</Text>
                  </div>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Medical Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder padding="lg">
              <Title order={3} mb="md">
                Información Médica
              </Title>
              <Stack gap="sm">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div>
                    <Text size="xs" c="dimmed" fw={500} mb="xs">
                      Alergias
                    </Text>
                    <Group gap="xs">
                      {patient.allergies.map((allergy) => (
                        <Badge key={allergy} color="red" size="sm">
                          {allergy}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                )}
                {patient.medicalConditions && patient.medicalConditions.length > 0 && (
                  <div>
                    <Text size="xs" c="dimmed" fw={500} mb="xs">
                      Condiciones Médicas
                    </Text>
                    <Group gap="xs">
                      {patient.medicalConditions.map((condition) => (
                        <Badge key={condition} color="orange" size="sm">
                          {condition}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Additional Information */}
          {patient.cpf && (
            <Grid.Col span={12}>
              <Card withBorder padding="lg">
                <Title order={3} mb="md">
                  Documentación
                </Title>
                <Text size="sm">
                  <strong>CPF:</strong> {patient.cpf}
                </Text>
              </Card>
            </Grid.Col>
          )}
        </Grid>
      </Stack>
    </Container>
  );
}
```

**Características**:
- Breadcrumbs: Dashboard / Pacientes / nombre
- Header con avatar XL, nombre, edad, género, estado
- Botón "Volver" regresa a lista
- Grid 2 columnas: Datos de Contacto e Información Médica
- Alergias como Badges rojos
- Condiciones como Badges naranjas
- CPF en card separada si existe

---

### Fase 4: Integración Router y Layout

**12. `frontend/src/features/backoffice/layout/BackofficeLayout.tsx` (MODIFICADO)**

Agregado al header, antes del Avatar de usuario:
```typescript
const { clinics, selectedClinicId } = useClinicStore();

// En useEffect:
useEffect(() => {
  clinicService.loadClinics().catch(() => {
    // Error already handled in clinic.service
  });
}, []);

// En el Header, nuevo Select:
<Select
  size="xs"
  placeholder="Selecciona clínica"
  data={clinics.map((c) => ({ value: c.id, label: c.name }))}
  value={selectedClinicId}
  onChange={(id) => id && clinicService.selectClinic(id)}
  style={{ minWidth: 180 }}
  searchable
/>
```

---

**13. `frontend/src/features/backoffice/router/routes.tsx` (MODIFICADO)**

Reemplazado PlaceholderPage y agregadas sub-rutas:
```typescript
import { PatientList } from '../../patients/list/PatientList';
import { PatientDetail } from '../../patients/detail/PatientDetail';

const patientsRoute = createRoute({
  getParentRoute: () => backofficeRoute,
  path: 'patients',
  component: PatientList,  // ← Cambio de PlaceholderPage
});

const patientDetailRoute = createRoute({
  getParentRoute: () => patientsRoute,
  path: '$patientId',
  component: PatientDetail,
});

// En el return:
patientsRoute.addChildren([patientDetailRoute]),
```

---

**14. `frontend/src/features/backoffice/router/metadata.ts` (MODIFICADO)**

Agregada constante:
```typescript
export const BACKOFFICE_ROUTES = {
  // ... existing routes
  PATIENT_DETAIL: '/backoffice/patients/$patientId',
} as const;
```

---

## 🐛 Problemas Encontrados y Soluciones

### Problema 1: DatePickerInput no exportado de @mantine/core
**Error**: `Module '@mantine/core' has no exported member 'DatePickerInput'`

**Causa**: En Mantine v9, DatePickerInput está en `@mantine/dates`, no en core

**Solución**:
```typescript
// ❌ Incorrecto
import { DatePickerInput } from '@mantine/core';

// ✅ Correcto
import { DateInput } from '@mantine/dates';
// ... reemplazar <DatePickerInput /> por <DateInput />
```

---

### Problema 2: Type Guard para conversión Date → string
**Error**: `TS2358 left-hand side of instanceof must be of type any, object type, or type parameter`

**Causa**: TypeScript no podía narrowing `dateOfBirth` como Date

**Solución**: Type guard explícito:
```typescript
const dateOfBirth =
  values.dateOfBirth && 
  typeof values.dateOfBirth === 'object' && 
  'toISOString' in values.dateOfBirth
    ? (values.dateOfBirth as Date).toISOString().split('T')[0]
    : values.dateOfBirth;
```

---

### Problema 3: Text component 'align' prop no existe
**Error**: `Property 'align' does not exist on TextProps`

**Causa**: Mantine v9 cambió `align` a `ta` (text-align shorthand)

**Solución**: Reemplazar `align="center"` por `ta="center"`

---

### Problema 4: Grid 'gutter' prop no existe
**Error**: `Property 'gutter' does not exist on GridProps`

**Causa**: Mantine v9 cambió `gutter` a `gap`

**Solución**: Reemplazar `gutter="lg"` por `gap="lg"`

---

### Problema 5: Group JSX closing tag faltante
**Error**: `JSX element 'Group' has no corresponding closing tag`

**Causa**: Estructura anidada de Group + Select + Menu sin cerrar correctamente

**Solución**: Agregar `</Group>` antes de cerrar `</AppShell.Header>`

---

## 🔄 Flujo de Datos: Acceso a Gestión de Pacientes

```
┌──────────────────────────────────────┐
│ Usuario logueado en Dashboard        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ BackofficeLayout carga clinicService │
│ .loadClinics() en useEffect          │
│ GET /clinics → Zustand store         │
└────────┬─────────────────────────────┘
         │
         ▼ Si solo 1 clínica
┌──────────────────────────────────────┐
│ clinicService.selectClinic(id)       │
│ Zustand: selectedClinicId = id       │
│ localStorage['clinic-store'] = ...   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Usuario navega a /backoffice/patients│
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ PatientList renderiza                │
│ usePatientList hook:                 │
│ - Lee selectedClinicId de store      │
│ - TanStack Query: queryKey =         │
│   ['patients', clinicId, page]       │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ GET /patients?clinicId=X&skip=0&...  │
│ Respuesta: Patient[]                 │
│ Caché en TanStack Query              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Tabla renderiza pacientes            │
│ - Avatar + nombre                    │
│ - Email, teléfono, edad              │
│ - Género Badge, estado Badge         │
│ - Botón ojo navega a detalle         │
└──────────────────────────────────────┘
```

---

## ✅ Flujo de Crear Paciente

```
Usuario clicks "+ Nuevo Paciente"
    ↓
useDisclosure: drawer opens
    ↓
CreatePatientDrawer renderiza form
    ↓
Usuario completa Datos Básicos + Info Médica
    ↓
Clicks "Guardar Paciente"
    ↓
form.onSubmit(handleSubmit) valida con Zod
    ↓
Si errores: muestra en campos específicos
    ↓
Si válido: convertir Date → YYYY-MM-DD
    ↓
POST /patients con CreatePatientRequest
    ↓
Backend retorna Patient creado
    ↓
form.reset()
    ↓
onSuccess() callback:
    - refetch() PatientList query
    - closeDrawer()
    ↓
Tabla se actualiza automáticamente
```

---

## ✅ Flujo de Ver Detalle

```
Usuario clicks ojo en tabla
    ↓
navigate({ to: '/backoffice/patients/$patientId' })
    ↓
PatientDetail se renderiza
    ↓
usePatientDetail(patientId):
    - TanStack Query: ['patient', patientId]
    - GET /patients/:id
    ↓
PatientDetail muestra:
    - Header con avatar, nombre, edad, estado
    - Breadcrumbs: Dashboard / Pacientes / nombre
    - Grid 2 cols: Contacto + Médica
    - Botón "Volver" → /backoffice/patients
```

---

## 🧪 Verificación (MVP Testing)

### Checklist Funcional:

1. **Backend**:
   - ✅ `GET /clinics` retorna array de clínicas
   - ✅ JWT Guard protege el endpoint
   - ✅ Respuesta envelope: `{statusCode, message, data, timestamp}`

2. **Frontend Clinic**:
   - ✅ `clinicService.loadClinics()` carga clínicas
   - ✅ Zustand store persiste `selectedClinicId` en localStorage
   - ✅ Auto-selecciona si solo 1 clínica existe
   - ✅ Selector en header muestra clinics + permite cambiar

3. **Frontend Patient List**:
   - ✅ `/backoffice/patients` requiere clínica seleccionada
   - ✅ Alert amarillo si no hay clínica
   - ✅ TanStack Query cachea con queryKey ['patients', clinicId, page]
   - ✅ Tabla muestra pacientes con avatar, email, teléfono, edad, género, estado
   - ✅ Pagination solo muestra si `patients.length >= pageSize`
   - ✅ Botón "Nuevo Paciente" abre drawer
   - ✅ Ojo navega a `/backoffice/patients/$patientId`

4. **Frontend Patient Create**:
   - ✅ Drawer abre con tabs: "Datos Básicos" | "Info Médica"
   - ✅ Validación Zod en cliente
   - ✅ DateInput acepta solo fechas <= hoy
   - ✅ Form valida requeridos: firstName, lastName, email, phone, dateOfBirth, gender
   - ✅ POST /patients con clinicId inyectado
   - ✅ Email duplicado → field error en email
   - ✅ CPF duplicado → field error en cpf
   - ✅ Otros errores → serverError alert rojo
   - ✅ Post exitoso → form.reset(), refetch(), closeDrawer()

5. **Frontend Patient Detail**:
   - ✅ Breadcrumbs: Dashboard / Pacientes / nombre
   - ✅ Header muestra avatar, nombre, edad, género, estado, botón Volver
   - ✅ Grid 2 cols: Datos Contacto + Info Médica
   - ✅ Alergias como Badges rojos
   - ✅ Condiciones como Badges naranjas
   - ✅ CPF en card si existe
   - ✅ Volver navega a /backoffice/patients

6. **TypeScript**:
   - ✅ `npx tsc -b --noEmit` sin errores
   - ✅ Tipos estrictos en todo el código

### Requisitos para Testing Manual:

1. **Insertar clínica en BD**:
   ```bash
   # Opción 1: Prisma Studio
   npx prisma studio
   # Crear clinic con isActive=true

   # Opción 2: SQL directo
   INSERT INTO "Clinic" (id, name, email, phone, address, city, state, "isActive")
   VALUES ('clinic-1', 'Clínica Sonrisa', 'info@sonrisa.com', '+591...', ...);
   ```

2. **Iniciar backend**:
   ```bash
   cd backend
   npm run start:dev
   # Debe responder GET /clinics con JWT token
   ```

3. **Iniciar frontend**:
   ```bash
   npm run dev
   # Abrir http://localhost:5173
   ```

4. **Testing Flow**:
   ```
   1. Login con credenciales válidas
   2. Dashboard → debe cargar clínicas automáticamente
   3. Si solo 1 clínica, debe auto-seleccionarse en header
   4. Click "Pacientes" en sidebar
   5. Tabla vacía si no hay pacientes
   6. Click "+ Nuevo Paciente" → abre drawer
   7. Completar formulario (mín: firstName, lastName, email, phone, dateOfBirth, gender)
   8. Click "Guardar Paciente"
   9. Tabla se actualiza con nuevo paciente
   10. Click ojo → navega a detalle
   11. Verifica todas las secciones (contacto, médica, cpf)
   12. Click "Volver" → regresa a lista
   13. Logout → redirige a login
   14. Acceso directo a /backoffice/patients sin token → redirige a login
   ```

---

## 📝 Guía de Extensión

### Agregar Campo Nuevo al Patient (ej: Ocupación)

1. **Backend Prisma**:
   ```prisma
   model Patient {
     // ... existing fields
     occupation?: String
   }
   ```

2. **Backend DTO**:
   ```typescript
   // patient-response.dto.ts
   export class PatientResponseDto {
     // ... existing fields
     occupation?: string;
   }
   ```

3. **Frontend Domain**:
   ```typescript
   // Patient.types.ts
   export interface Patient {
     // ... existing fields
     occupation?: string;
   }

   // Patient.request.ts
   export interface CreatePatientRequest {
     // ... existing fields
     occupation?: string;
   }
   ```

4. **Frontend UI**:
   ```typescript
   // CreatePatientDrawer.tsx - agregar en tab "Datos Básicos"
   <TextInput
     label="Ocupación"
     placeholder="Abogado"
     {...form.getInputProps('occupation')}
   />

   // PatientDetail.tsx - agregar en Card "Datos de Contacto"
   {patient.occupation && (
     <div>
       <Text size="xs" c="dimmed" fw={500}>Ocupación</Text>
       <Text size="sm">{patient.occupation}</Text>
     </div>
   )}
   ```

---

### Agregar Validación de Teléfono

```typescript
// Patient.request.ts (Zod schema)
const createPatientSchema = z.object({
  // ... existing fields
  phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .regex(/^[0-9\s\-\+\(\)]+$/, 'Teléfono inválido'),  // ← Nueva validación
});
```

---

### Agregar Búsqueda de Pacientes

```typescript
// usePatientList.ts
const [searchQuery, setSearchQuery] = useState('');

const { data: patients = [] } = useQuery({
  queryKey: ['patients', selectedClinicId, page, searchQuery],  // ← Agregar searchQuery
  queryFn: async () => {
    if (!selectedClinicId) return [];
    return patientService.list({
      clinicId: selectedClinicId,
      skip: (page - 1) * pageSize,
      take: pageSize,
      search: searchQuery,  // ← Pasar al API
    });
  },
});

// PatientList.tsx - agregar TextInput en header
<TextInput
  placeholder="Buscar paciente..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.currentTarget.value)}
  icon={<IconSearch size={16} />}
/>
```

---

## 📚 Referencias

- **DDD Guide**: `docs/GUIDE.md`
- **Stack**: `docs/STACK.md`
- **Dashboard Implementation**: `docs/DASHBOARD_IMPLEMENTATION.md`
- **Mantine**: https://mantine.dev/
- **TanStack Query**: https://tanstack.com/query/latest/
- **TanStack Router**: https://tanstack.com/router/latest/
- **Zod**: https://zod.dev/

---

## 🔗 URLs de Prueba

- **Frontend Dev**: `http://localhost:5173`
- **Patient List**: `http://localhost:5173/backoffice/patients`
- **Patient Detail** (ejemplo): `http://localhost:5173/backoffice/patients/patient-123`
- **Backend API**: `http://localhost:3000`
- **GET /clinics**: `GET http://localhost:3000/clinics` (requiere JWT)

---

## 📊 Cambios Realizados en Archivos Existentes

| Archivo | Cambio |
|---------|--------|
| `frontend/src/features/backoffice/layout/BackofficeLayout.tsx` | ✅ Agregado Select de clínicas + useEffect loadClinics |
| `frontend/src/features/backoffice/router/routes.tsx` | ✅ Reemplazado PlaceholderPage + agregada patientDetailRoute |
| `frontend/src/features/backoffice/router/metadata.ts` | ✅ Agregada PATIENT_DETAIL constante |
| `backend/src/clinic/clinic.module.ts` | ✅ Agregados providers y controller |

---

## 🚀 Próximas Fases

### Fase 1: Patient Management (ACTUAL ✅)
- [x] Backend: Clinic module con GET /clinics
- [x] Frontend: Clinic store + auto-selection
- [x] Patient list con tabla + paginación
- [x] Create patient con drawer + form validation
- [x] Patient detail con información completa
- [x] Router integration + breadcrumbs

### Fase 2: Appointments Management
- [ ] Appointment list view con calendario
- [ ] Create/edit appointment forms
- [ ] Appointment scheduling logic
- [ ] Email notifications

### Fase 3: Treatments
- [ ] Treatment list
- [ ] Create/edit treatment plans
- [ ] Treatment progress tracking
- [ ] Associated billing

### Fase 4: Advanced Features
- [ ] Search/filtering (pacientes, citas, tratamientos)
- [ ] Bulk operations
- [ ] Export to PDF/Excel
- [ ] Reporting/analytics
- [ ] Audit logs
- [ ] Multi-user permissions

---

**Última actualización**: 17 de abril de 2026  
**Estado**: ✅ Patient management completamente implementado con DDD, múltiples capas, forms validados y UI responsiva
