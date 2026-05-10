import { httpClient } from '../../../../core/api/httpClient';

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  clinicId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceListApiResponse {
  statusCode: number;
  message: string;
  data: Service[];
  timestamp: string;
}

export async function listServices(clinicId: string): Promise<Service[]> {
  const res = await httpClient.get<ServiceListApiResponse>('/services', {
    params: { clinicId, isActive: true },
  });
  return res.data.data;
}
