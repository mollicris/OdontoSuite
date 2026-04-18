export class ClinicEntity {
  id!: string;
  name!: string;
  email!: string;
  phone!: string;
  address!: string;
  city!: string;
  state!: string;
  zipCode!: string;
  country!: string;
  logo?: string;
  website?: string;
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: any) {
    Object.assign(this, data);
  }
}
