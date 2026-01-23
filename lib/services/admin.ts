/**
 * Admin Service
 * Handles all admin-related API calls
 */

import { api, apiDownload } from '../api';
import type {
  Country,
  Payment,
  Participant,
  AuditLog,
  StageDeadline,
  CountryStageStatus,
  PaginatedResponse,
  PreRegistration,
  User,
} from '../types';

// Extended types for admin
export interface AdminCountry extends Country {
  account?: {
    id: string;
    username: string;
    is_active: boolean;
    plain_password?: string;
  };
  pre_registration?: PreRegistration;
  participant_count?: number;
  payment_status?: string;
}

export interface AdminPayment extends Payment {
  country_name?: string;
  country_iso?: string;
  invoice_number?: string;
  invoice_amount?: number;
  proof_submitted_at?: string;
}

export interface AdminParticipant extends Participant {
  country_name?: string;
  country_iso?: string;
}

export interface AdminStats {
  total_countries: number;
  active_countries: number;
  total_participants: number;
  participants_by_role: {
    team_leaders: number;
    contestants: number;
    observers: number;
    guests: number;
  };
  payments: {
    pending: number;
    approved: number;
    rejected: number;
    total_amount: number;
  };
  stages: {
    pre_registration: number;
    payment: number;
    participants: number;
    travel: number;
    invitations: number;
  };
}

export interface UnlockStageRequest {
  stage: string;
  reason: string;
  duration_hours?: number;
}

export const adminService = {
  // ============= Dashboard Stats =============

  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    return api.get<AdminStats>('/v1/admin/stats/');
  },

  // ============= Countries Management =============

  /**
   * Get all countries with their account info
   */
  async getCountries(): Promise<AdminCountry[]> {
    return api.get<AdminCountry[]>('/v1/admin/countries/');
  },

  /**
   * Get a single country with full details
   */
  async getCountry(countryId: string): Promise<AdminCountry> {
    return api.get<AdminCountry>(`/v1/admin/countries/${countryId}/`);
  },

  /**
   * Toggle country active status
   */
  async toggleCountryStatus(countryId: string, isActive: boolean): Promise<AdminCountry> {
    return api.patch<AdminCountry>(`/v1/admin/countries/${countryId}/`, { is_active: isActive });
  },

  /**
   * Regenerate country password
   */
  async regeneratePassword(countryId: string): Promise<{ password: string }> {
    return api.post<{ password: string }>(`/v1/admin/countries/${countryId}/regenerate-password/`);
  },

  /**
   * Export credentials to Excel
   */
  async exportCredentials(): Promise<Blob> {
    return apiDownload('/admin/credentials/export.xlsx');
  },

  // ============= Payments Management =============

  /**
   * Get all payments with filtering
   */
  async getPayments(status?: string): Promise<AdminPayment[]> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return api.get<AdminPayment[]>(`/v1/admin/payments/${params}`);
  },

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<AdminPayment> {
    return api.get<AdminPayment>(`/v1/admin/payments/${paymentId}/`);
  },

  /**
   * Approve a payment
   */
  async approvePayment(paymentId: string, comment?: string): Promise<AdminPayment> {
    return api.post<AdminPayment>(`/v1/admin/payments/${paymentId}/approve/`, { admin_comment: comment });
  },

  /**
   * Reject a payment
   */
  async rejectPayment(paymentId: string, comment: string): Promise<AdminPayment> {
    return api.post<AdminPayment>(`/v1/admin/payments/${paymentId}/reject/`, { admin_comment: comment });
  },

  /**
   * Download payment proof file
   */
  async downloadPaymentProof(paymentId: string): Promise<Blob> {
    return apiDownload(`/v1/admin/payments/${paymentId}/proof/download/`);
  },

  // ============= Participants Management =============

  /**
   * Get all participants across all countries
   */
  async getParticipants(filters?: {
    country?: string;
    role?: string;
    search?: string;
  }): Promise<AdminParticipant[]> {
    const params = new URLSearchParams();
    if (filters?.country && filters.country !== 'all') params.append('country', filters.country);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<AdminParticipant[]>(`/v1/admin/participants/${query}`);
  },

  /**
   * Export participants to Excel
   */
  async exportParticipants(filters?: { country?: string; role?: string }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.country && filters.country !== 'all') params.append('country', filters.country);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiDownload(`/v1/admin/participants/export.xlsx${query}`);
  },

  // ============= Workflow Management =============

  /**
   * Get all stage deadlines
   */
  async getDeadlines(): Promise<StageDeadline[]> {
    return api.get<StageDeadline[]>('/v1/admin/deadlines/');
  },

  /**
   * Update a stage deadline
   */
  async updateDeadline(stageId: string, deadline: string): Promise<StageDeadline> {
    return api.patch<StageDeadline>(`/v1/admin/deadlines/${stageId}/`, { deadline_at: deadline });
  },

  /**
   * Get all countries progress
   */
  async getCountriesProgress(): Promise<CountryStageStatus[]> {
    return api.get<CountryStageStatus[]>('/v1/admin/countries/progress/');
  },

  /**
   * Unlock a stage for a country
   */
  async unlockStage(countryId: string, request: UnlockStageRequest): Promise<CountryStageStatus> {
    return api.post<CountryStageStatus>(`/v1/admin/countries/${countryId}/unlock-stage/`, request);
  },

  /**
   * Lock a stage for a country
   */
  async lockStage(countryId: string, stage: string): Promise<CountryStageStatus> {
    return api.post<CountryStageStatus>(`/v1/admin/countries/${countryId}/lock-stage/`, { stage });
  },

  // ============= Audit Logs =============

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters?: {
    action?: string;
    actor?: string;
    country?: string;
    entity_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams();
    if (filters?.action && filters.action !== 'all') params.append('action', filters.action);
    if (filters?.actor) params.append('actor', filters.actor);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.entity_type) params.append('entity_type', filters.entity_type);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<PaginatedResponse<AuditLog>>(`/v1/admin/audit-logs/${query}`);
  },

  /**
   * Export audit logs to Excel
   */
  async exportAuditLogs(filters?: {
    action?: string;
    country?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.action && filters.action !== 'all') params.append('action', filters.action);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiDownload(`/v1/admin/audit-logs/export.xlsx${query}`);
  },

  // ============= Travel Export =============

  /**
   * Export travel data to Excel
   */
  async exportTravelData(): Promise<Blob> {
    return apiDownload('/admin/travel/export.xlsx');
  },

  // ============= Invitations =============

  /**
   * Regenerate invitation for a participant
   */
  async regenerateInvitation(participantId: string, reason: string): Promise<void> {
    return api.post(`/v1/admin/invitations/${participantId}/regenerate/`, { reason });
  },
};

export default adminService;
