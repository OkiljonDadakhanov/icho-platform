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
  FeeRule,
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
   * Get all contact persons for the current country
   */
  async getCoordinators(): Promise<Coordinator[]> {
    return api.get<Coordinator[]>('/pre-registration/coordinators/');
  },

  /**
   * Create a contact person
   */
  async createCoordinator(data: CoordinatorUpsertRequest): Promise<Coordinator> {
    return api.post<Coordinator>('/pre-registration/coordinators/', data);
  },

  /**
   * Update a contact person
   */
  async updateCoordinator(id: string, data: Partial<CoordinatorUpsertRequest>): Promise<Coordinator> {
    return api.patch<Coordinator>(`/pre-registration/coordinators/${id}/`, data);
  },

  /**
   * Delete a contact person
   */
  async deleteCoordinator(id: string): Promise<void> {
    return api.delete(`/pre-registration/coordinators/${id}/`);
  },

  /**
   * Get fee rules
   */
  async getFeeRules(): Promise<FeeRule[]> {
    return api.get<FeeRule[]>('/pre-registration/fee-rules/');
  },
};

export default preRegistrationService;
