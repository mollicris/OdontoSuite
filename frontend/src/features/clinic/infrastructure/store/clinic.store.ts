import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Clinic, ClinicState } from '../../domain/Clinic.types';

interface ClinicStore extends ClinicState {
  setClinics: (clinics: Clinic[]) => void;
  selectClinic: (clinicId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ClinicState = {
  clinics: [],
  selectedClinicId: null,
  isLoading: false,
  error: null,
};

export const useClinicStore = create<ClinicStore>()(
  persist(
    (set) => ({
      ...initialState,

      setClinics: (clinics) => set({ clinics }),
      selectClinic: (clinicId) => set({ selectedClinicId: clinicId }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'clinic-store',
      partialize: (state) => ({ selectedClinicId: state.selectedClinicId }),
    },
  ),
);
