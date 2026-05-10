export class ServiceEntity {
  id!: string;
  clinicId!: string;
  name!: string;
  description?: string;
  duration!: number; // in minutes
  price!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(props: Partial<ServiceEntity>) {
    Object.assign(this, props);
  }
}
