import { useAuthStore } from '../../infrastructure/store/auth.store';
import { UserRole, ROLE_PERMISSIONS, canAccess, hasPermission } from '../../domain/roles';

export function useRole() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !user) {
    return {
      user: null,
      role: null,
      permissions: [],
      isAdmin: false,
      isDentist: false,
      isSecretary: false,
      isPatient: false,
      hasPermission: () => false,
      canAccess: () => false,
    };
  }

  const role = user.role || (user.roleId as UserRole);
  const permissions = user.permissions || ROLE_PERMISSIONS[role] || [];

  return {
    user,
    role,
    permissions,
    isAuthenticated: true,
    isAdmin: role === UserRole.ADMIN,
    isDentist: role === UserRole.DENTIST,
    isSecretary: role === UserRole.SECRETARY,
    isPatient: role === UserRole.PATIENT,
    hasPermission: (perm: string) => hasPermission(permissions, perm),
    canAccess: (...perms: string[]) => canAccess(permissions, ...perms),
  };
}
