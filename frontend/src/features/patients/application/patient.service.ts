import {
  createPatient,
  getPatientById,
  listPatients,
  updatePatient,
  deactivatePatient,
} from '../infrastructure/api/patient.api';
import type { CreatePatientRequest, ListPatientsRequest } from '../domain/Patient.request';
import type { Patient } from '../domain/Patient.types';

export const patientService = {
  async create(req: CreatePatientRequest): Promise<Patient> {
    return createPatient(req);
  },

  async getById(id: string): Promise<Patient> {
    return getPatientById(id);
  },

  async list(req: ListPatientsRequest): Promise<Patient[]> {
    return listPatients(req);
  },

  async update(id: string, req: Partial<CreatePatientRequest>): Promise<Patient> {
    return updatePatient(id, req);
  },

  async deactivate(id: string): Promise<Patient> {
    return deactivatePatient(id);
  },
};
