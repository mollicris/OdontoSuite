import type { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useRole } from '../../auth/application/hooks/useRole';
import type { UserRole } from '../../auth/domain/roles';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role, isAuthenticated } = useRole();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return fallback || <Navigate to="/backoffice/dashboard" />;
  }

  return <>{children}</>;
}
