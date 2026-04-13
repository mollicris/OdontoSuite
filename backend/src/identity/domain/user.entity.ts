export class UserEntity {
  id!: string;
  email!: string;
  password!: string; // hashed
  firstName!: string;
  lastName!: string;
  phone?: string;
  avatar?: string;
  isActive!: boolean;
  emailVerified!: boolean;
  roleId!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<UserEntity>) {
    Object.assign(this, data);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  isVerified(): boolean {
    return this.emailVerified;
  }
}
