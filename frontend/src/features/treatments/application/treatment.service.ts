import {
  createTreatment,
  getTreatmentById,
  listTreatments,
  updateTreatment,
  changeTreatmentStatus,
  deleteTreatment,
} from '../infrastructure/api/treatment.api';
import type {
  CreateTreatmentRequest,
  UpdateTreatmentRequest,
  ListTreatmentsRequest,
} from '../domain/Treatment.request';
import type { TreatmentStatus } from '../domain/Treatment.types';
import type { Treatment } from '../domain/Treatment.types';

export const treatmentService = {
  async create(req: CreateTreatmentRequest): Promise<Treatment> {
    return createTreatment(req);
  },

  async getById(id: string): Promise<Treatment> {
    return getTreatmentById(id);
  },

  async list(req: ListTreatmentsRequest): Promise<Treatment[]> {
    return listTreatments(req);
  },

  async update(id: string, req: UpdateTreatmentRequest): Promise<Treatment> {
    return updateTreatment(id, req);
  },

  async changeStatus(id: string, status: TreatmentStatus): Promise<Treatment> {
    return changeTreatmentStatus(id, status);
  },

  async delete(id: string): Promise<void> {
    return deleteTreatment(id);
  },
};
