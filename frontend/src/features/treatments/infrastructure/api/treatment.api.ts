import { httpClient } from '../../../../core/api/httpClient';
import type {
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
  ListTreatmentsRequest,
} from '../../domain/Treatment.request';
import type { TreatmentStatus } from '../../domain/Treatment.types';
import type { TreatmentApiResponse, TreatmentListApiResponse } from '../../domain/Treatment.response';
import type { Treatment } from '../../domain/Treatment.types';

export async function createTreatment(req: CreateTreatmentRequest): Promise<Treatment> {
  const res = await httpClient.post<TreatmentApiResponse>('/treatments', req);
  return res.data.data;
}

export async function getTreatmentById(id: string): Promise<Treatment> {
  const res = await httpClient.get<TreatmentApiResponse>(`/treatments/${id}`);
  return res.data.data;
}

export async function listTreatments(req: ListTreatmentsRequest): Promise<Treatment[]> {
  const { patientId, status, serviceId, skip = 0, take = 10 } = req;
  const res = await httpClient.get<TreatmentListApiResponse>('/treatments', {
    params: {
      patientId,
      ...(status && status !== 'ALL' && { status }),
      ...(serviceId && { serviceId }),
      skip,
      take,
    },
  });
  return res.data.data;
}

export async function updateTreatment(id: string, req: UpdateTreatmentRequest): Promise<Treatment> {
  const res = await httpClient.patch<TreatmentApiResponse>(`/treatments/${id}`, req);
  return res.data.data;
}

export async function changeTreatmentStatus(id: string, status: TreatmentStatus): Promise<Treatment> {
  const res = await httpClient.patch<TreatmentApiResponse>(`/treatments/${id}/status`, { status });
  return res.data.data;
}

export async function deleteTreatment(id: string): Promise<void> {
  await httpClient.delete(`/treatments/${id}`);
}
