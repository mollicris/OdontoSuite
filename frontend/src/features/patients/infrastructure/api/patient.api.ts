import { httpClient } from '../../../../core/api/httpClient';
import type { CreatePatientRequest, ListPatientsRequest } from '../../domain/Patient.request';
import type {
  PatientApiResponse,
  PatientListApiResponse,
  CreatePatientApiResponse,
} from '../../domain/Patient.response';
import type { Patient } from '../../domain/Patient.types';

export async function createPatient(req: CreatePatientRequest): Promise<Patient> {
  const res = await httpClient.post<CreatePatientApiResponse>('/patients', req);
  return res.data.data;
}

export async function getPatientById(id: string): Promise<Patient> {
  const res = await httpClient.get<PatientApiResponse>(`/patients/${id}`);
  return res.data.data;
}

export async function listPatients(req: ListPatientsRequest): Promise<Patient[]> {
  const { clinicId, skip = 0, take = 10 } = req;
  const res = await httpClient.get<PatientListApiResponse>('/patients', {
    params: { clinicId, skip, take },
  });
  return res.data.data;
}

export async function updatePatient(
  id: string,
  req: Partial<CreatePatientRequest>,
): Promise<Patient> {
  const res = await httpClient.patch<PatientApiResponse>(`/patients/${id}`, req);
  return res.data.data;
}

export async function deactivatePatient(id: string): Promise<Patient> {
  const res = await httpClient.patch<PatientApiResponse>(`/patients/${id}/deactivate`);
  return res.data.data;
}
