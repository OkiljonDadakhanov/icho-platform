/**
 * Pre-Registration Service
 * Handles pre-registration API calls
 */

import { api } from '../api';
import type {
  PreRegistration,
  PreRegistrationUpdateRequest,
  Coordinator,
  CoordinatorUpsertRequest,
} from '../types';

export const preRegistrationService = {
  /**
   * Get current pre-registration details
   */
  async getPreRegistration(): Promise<PreRegistration> {
    return api.get<PreRegistration>('/pre-registration/');
  },

  /**
   * Update pre-registration counts
   */
  async updatePreRegistration(data: PreRegistrationUpdateRequest): Promise<PreRegistration> {
    return api.put<PreRegistration>('/pre-registration/', data);
  },

  /**
   * Submit pre-registration
   */
  async submitPreRegistration(): Promise<PreRegistration> {
    return api.post<PreRegistration>('/pre-registration/submit/');
  },

  /**
   * Get all coordinators for the current country
   */
  async getCoordinators(): Promise<Coordinator[]> {
    return api.get<Coordinator[]>('/pre-registration/coordinators/');
  },

  /**
   * Create a coordinator
   */
  async createCoordinator(data: CoordinatorUpsertRequest): Promise<Coordinator> {
    return api.post<Coordinator>('/pre-registration/coordinators/', data);
  },

  /**
   * Update a coordinator
   */
  async updateCoordinator(id: string, data: Partial<CoordinatorUpsertRequest>): Promise<Coordinator> {
    return api.patch<Coordinator>(`/pre-registration/coordinators/${id}/`, data);
  },

  /**
   * Upload coordinator passport scan
   */
  async uploadCoordinatorPassport(coordinatorId: string, file: File): Promise<Coordinator> {
    const formData = new FormData();
    formData.append('passport_scan', file);
    return api.upload<Coordinator>(`/pre-registration/coordinators/${coordinatorId}/passport/`, formData);
  },
};

export default preRegistrationService;
