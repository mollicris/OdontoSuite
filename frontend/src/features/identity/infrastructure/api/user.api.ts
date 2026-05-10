import { httpClient } from '../../../../core/api/httpClient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  clinicId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListApiResponse {
  statusCode: number;
  message: string;
  data: User[];
  timestamp: string;
}

export async function listDentists(clinicId: string): Promise<User[]> {
  const res = await httpClient.get<UserListApiResponse>('/users', {
    params: { clinicId, role: 'DENTIST', isActive: true },
  });
  return res.data.data;
}
