export const UserRole = {
  ADMIN: 'admin',
  DENTIST: 'dentist',
  SECRETARY: 'secretary',
  PATIENT: 'patient',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.DENTIST]: 'Dentista',
  [UserRole.SECRETARY]: 'Secretaria',
  [UserRole.PATIENT]: 'Paciente',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*:*'],
  [UserRole.DENTIST]: ['read:patients', 'write:appointments', 'write:treatments', 'read:invoices'],
  [UserRole.SECRETARY]: ['read:appointments', 'write:appointments', 'read:patients', 'read:invoices', 'write:invoices'],
  [UserRole.PATIENT]: ['read:own-appointments', 'read:own-medical-history'],
};

export function hasPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes('*:*')) return true;
  return userPermissions.includes(required);
}

export function canAccess(userPermissions: string[], ...required: string[]): boolean {
  return required.every((perm) => hasPermission(userPermissions, perm));
}
