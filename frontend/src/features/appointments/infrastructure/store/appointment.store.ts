import { create } from 'zustand';
import type { AppointmentStatus } from '../../domain/Appointment.types';

interface AppointmentStore {
  selectedDate: Date;
  viewMode: 'day' | 'week' | 'month';
  selectedAppointmentId: string | null;
  statusFilter: AppointmentStatus | 'ALL';
  searchQuery: string;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  setSelectedAppointmentId: (id: string | null) => void;
  setStatusFilter: (status: AppointmentStatus | 'ALL') => void;
  setSearchQuery: (query: string) => void;
}

export const useAppointmentStore = create<AppointmentStore>()((set) => ({
  selectedDate: new Date(),
  viewMode: 'day',
  selectedAppointmentId: null,
  statusFilter: 'ALL',
  searchQuery: '',

  setSelectedDate: (date) => set({ selectedDate: date, selectedAppointmentId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedAppointmentId: (id) => set({ selectedAppointmentId: id }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
