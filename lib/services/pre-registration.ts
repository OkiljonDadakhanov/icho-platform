/**
 * Pre-Registration Service
 * Handles pre-registration API calls
 */

import { api } from '../api';
import type { PreRegistration, PreRegistrationSubmitRequest, Coordinator } from '../types';

export const preRegistrationService = {
  /**
   * Get current pre-registration details
   */
  async getPreRegistration(): Promise<PreRegistration> {
    return api.get<PreRegistration>('/pre-registration/');
  },

  /**
   * Submit pre-registration
   */
  async submitPreRegistration(data: PreRegistrationSubmitRequest): Promise<PreRegistration> {
    return api.post<PreRegistration>('/pre-registration/submit/', data);
  },

  /**
   * Get coordinator details
   */
  async getCoordinator(): Promise<Coordinator> {
    return api.get<Coordinator>('/pre-registration/coordinator/');
  },

  /**
   * Update coordinator
   */
  async updateCoordinator(data: Partial<Coordinator>): Promise<Coordinator> {
    return api.patch<Coordinator>('/pre-registration/coordinator/', data);
  },

  /**
   * Upload coordinator passport scan
   */
  async uploadPassportScan(file: File): Promise<Coordinator> {
    const formData = new FormData();
    formData.append('passport_scan', file);
    return api.upload<Coordinator>('/pre-registration/coordinator/passport/', formData);
  },
};

export default preRegistrationService;
