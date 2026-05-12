export interface IAvailabilityService {
  getAvailableSlots(
    clinicId: string,
    date: string,
    dentistId: string,
    serviceDurationMinutes?: number,
  ): Promise<string[]>;
}

export const AVAILABILITY_SERVICE = Symbol('IAvailabilityService');
