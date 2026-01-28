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
  SingleRoomInvoice,
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

export interface AdminTravelInfo {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_role: string;
  country: string;
  country_name: string;
  country_iso: string;
  arrival_datetime: string | null;
  departure_datetime: string | null;
  flight_number: string;
  airline: string;
  ticket_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAccommodation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_role: string;
  country: string;
  country_name: string;
  country_iso: string;
  room_type: string;
  preferred_roommate: string | null;
  accessibility_requirements: string;
  early_check_in: boolean;
  late_check_out: boolean;
  additional_nights_before: number;
  additional_nights_after: number;
  notes: string;
  created_at: string;
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
   * Export countries/analytics to Excel
   */
  async exportCountries(): Promise<Blob> {
    return apiDownload('/v1/admin/analytics/export.xlsx');
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

  /**
   * Export payments to Excel
   */
  async exportPayments(status?: string): Promise<Blob> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return apiDownload(`/v1/admin/payments/export.xlsx${params}`);
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

  // ============= Travel Management =============

  /**
   * Get all travel info across all countries
   */
  async getTravelInfo(filters?: {
    country?: string;
    search?: string;
  }): Promise<AdminTravelInfo[]> {
    const params = new URLSearchParams();
    if (filters?.country && filters.country !== 'all') params.append('country', filters.country);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<AdminTravelInfo[]>(`/v1/admin/travel/${query}`);
  },

  /**
   * Get all accommodation preferences across all countries
   */
  async getAccommodation(filters?: {
    country?: string;
  }): Promise<AdminAccommodation[]> {
    const params = new URLSearchParams();
    if (filters?.country && filters.country !== 'all') params.append('country', filters.country);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<AdminAccommodation[]>(`/v1/admin/accommodation/${query}`);
  },

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

  // ============= Single Room Payments =============

  /**
   * Get all single room invoices with filtering
   */
  async getSingleRoomInvoices(status?: string): Promise<SingleRoomInvoice[]> {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return api.get<SingleRoomInvoice[]>(`/v1/payments/admin/single-room-invoices/${params}`);
  },

  /**
   * Approve a single room payment
   */
  async approveSingleRoomPayment(invoiceId: string, comment?: string): Promise<SingleRoomInvoice> {
    return api.post<SingleRoomInvoice>(`/v1/payments/admin/single-room-invoices/${invoiceId}/approve/`, { admin_comment: comment });
  },

  /**
   * Reject a single room payment
   */
  async rejectSingleRoomPayment(invoiceId: string, comment: string): Promise<SingleRoomInvoice> {
    return api.post<SingleRoomInvoice>(`/v1/payments/admin/single-room-invoices/${invoiceId}/reject/`, { admin_comment: comment });
  },

  /**
   * Download single room payment proof file
   */
  async downloadSingleRoomProof(invoiceId: string): Promise<Blob> {
    return apiDownload(`/v1/payments/admin/single-room-invoices/${invoiceId}/proof/download/`);
  },
};

export default adminService;
