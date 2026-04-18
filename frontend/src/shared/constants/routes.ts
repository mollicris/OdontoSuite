export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  BACKOFFICE: {
    DASHBOARD: '/backoffice/dashboard',
    PATIENTS: '/backoffice/patients',
    APPOINTMENTS: '/backoffice/appointments',
    TREATMENTS: '/backoffice/treatments',
    BILLING: '/backoffice/billing',
    CLINIC: '/backoffice/clinic',
    REPORTS: '/backoffice/reports',
  },
} as const;
