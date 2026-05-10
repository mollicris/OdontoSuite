export class ListServicesDto {
  clinicId?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export class ServiceResponseDto {
  id!: string;
  clinicId!: string;
  name!: string;
  description?: string;
  duration!: number;
  price!: number;
  isActive!: boolean;
  createdAt!: string;
  updatedAt!: string;
}
