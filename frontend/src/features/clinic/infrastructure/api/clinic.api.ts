import { httpClient } from '../../../../core/api/httpClient';
import type { ClinicListApiResponse } from '../../domain/Clinic.response';
import type { Clinic } from '../../domain/Clinic.types';

export async function fetchClinics(): Promise<Clinic[]> {
  const res = await httpClient.get<ClinicListApiResponse>('/clinics');
  return res.data.data;
}
