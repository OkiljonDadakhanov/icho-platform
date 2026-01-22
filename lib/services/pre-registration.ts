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
   * Get all coordinators for the current country
   */
  async getCoordinators(): Promise<Coordinator[]> {
    return api.get<Coordinator[]>('/pre-registration/coordinators/');
  },

  /**
   * Create a coordinator
   */
  async createCoordinator(
    data: CoordinatorUpsertRequest,
    passportScan?: File
  ): Promise<Coordinator> {
    if (passportScan) {
      const formData = new FormData();
      formData.append('full_name', data.full_name);
      formData.append('role', data.role);
      formData.append('gender', data.gender);
      formData.append('date_of_birth', data.date_of_birth);
      formData.append('passport_number', data.passport_number);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.is_primary !== undefined) {
        formData.append('is_primary', String(data.is_primary));
      }
      formData.append('passport_scan', passportScan);
      return api.upload<Coordinator>('/pre-registration/coordinators/', formData);
    }
    return api.post<Coordinator>('/pre-registration/coordinators/', data);
  },

  /**
   * Update a coordinator
   */
  async updateCoordinator(id: string, data: Partial<CoordinatorUpsertRequest>): Promise<Coordinator> {
    const { passport_scan, ...rest } = data;

    if (passport_scan) {
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, String(value));
        }
      });
      formData.append('passport_scan', passport_scan);
      return api.uploadPatch<Coordinator>(`/pre-registration/coordinators/${id}/`, formData);
    }
    return api.patch<Coordinator>(`/pre-registration/coordinators/${id}/`, rest);
  },

  /**
   * Upload coordinator passport scan
   */
  async uploadCoordinatorPassport(coordinatorId: string, file: File): Promise<Coordinator> {
    const formData = new FormData();
    formData.append('passport_scan', file);
    return api.upload<Coordinator>(`/pre-registration/coordinators/${coordinatorId}/passport/`, formData);
  },

  /**
   * Get fee rules
   */
  async getFeeRules(): Promise<FeeRule[]> {
    return api.get<FeeRule[]>('/pre-registration/fee-rules/');
  },
};

export default preRegistrationService;
