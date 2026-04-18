export class RoleEntity {
  id!: string;
  name!: string;
  description?: string;
  permissions!: string[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<RoleEntity>) {
    Object.assign(this, data);
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
