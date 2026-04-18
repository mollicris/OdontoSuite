export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  completedTreatments: number;
  pendingBilling: number;
}

export interface UpcomingAppointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
}

export function useDashboard() {
  // Datos mock - en producción vendrían de una API
  const stats: DashboardStats = {
    totalPatients: 156,
    todayAppointments: 8,
    completedTreatments: 42,
    pendingBilling: 12,
  };

  const upcomingAppointments: UpcomingAppointment[] = [
    {
      id: '1',
      patientName: 'Juan Pérez',
      time: '09:00 AM',
      type: 'Limpieza',
    },
    {
      id: '2',
      patientName: 'María García',
      time: '10:30 AM',
      type: 'Revisión',
    },
    {
      id: '3',
      patientName: 'Carlos López',
      time: '02:00 PM',
      type: 'Tratamiento',
    },
  ];

  const recentActivity = [
    { id: '1', action: 'Cita completada', patient: 'Juan Pérez', time: 'hace 2 horas' },
    { id: '2', action: 'Paciente registrado', patient: 'Ana Martínez', time: 'hace 4 horas' },
    { id: '3', action: 'Factura emitida', patient: 'Carlos López', time: 'hace 1 día' },
  ];

  return {
    stats,
    upcomingAppointments,
    recentActivity,
  };
}
