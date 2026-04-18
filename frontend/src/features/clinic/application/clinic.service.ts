import { fetchClinics } from '../infrastructure/api/clinic.api';
import { useClinicStore } from '../infrastructure/store/clinic.store';
import type { Clinic } from '../domain/Clinic.types';

export const clinicService = {
  async loadClinics(): Promise<Clinic[]> {
    const store = useClinicStore.getState();
    if (store.isLoading) return store.clinics;

    store.setLoading(true);
    store.setError(null);
    try {
      const clinics = await fetchClinics();
      useClinicStore.getState().setClinics(clinics);
      if (clinics.length === 1 && !useClinicStore.getState().selectedClinicId) {
        useClinicStore.getState().selectClinic(clinics[0].id);
      }
      return clinics;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error al cargar clínicas';
      useClinicStore.getState().setError(Array.isArray(msg) ? msg.join(', ') : msg);
      throw error;
    } finally {
      useClinicStore.getState().setLoading(false);
    }
  },

  selectClinic(clinicId: string): void {
    useClinicStore.getState().selectClinic(clinicId);
  },

  getSelectedClinicId(): string | null {
    return useClinicStore.getState().selectedClinicId;
  },

  getClinics(): Clinic[] {
    return useClinicStore.getState().clinics;
  },
};
