/**
 * Invitations Service
 * Handles invitation letter API calls
 */

import { api, apiDownload } from '../api';
import type { InvitationLetter, PaginatedResponse } from '../types';

export interface InvitationStatus {
  participant_id: string;
  participant_name: string;
  status: string;
  letter_number?: string;
  generated_at?: string;
  can_request: boolean;
  can_download: boolean;
}

export const invitationsService = {
  /**
   * Get all invitations for current country
   */
  async getInvitations(): Promise<PaginatedResponse<InvitationLetter>> {
    return api.get<PaginatedResponse<InvitationLetter>>('/v1/invitations/');
  },

  /**
   * Get all invitations without pagination
   */
  async getAllInvitations(): Promise<InvitationLetter[]> {
    const response = await api.get<PaginatedResponse<InvitationLetter>>('/v1/invitations/?page_size=100');
    return response.results;
  },

  /**
   * Get invitation status for a participant
   */
  async getParticipantInvitationStatus(participantId: string): Promise<InvitationStatus> {
    return api.get<InvitationStatus>(`/v1/invitations/participant/${participantId}/status/`);
  },

  /**
   * Request invitation letter for a participant
   */
  async requestInvitation(participantId: string): Promise<InvitationLetter> {
    return api.post<InvitationLetter>(`/v1/invitations/participant/${participantId}/request/`);
  },

  /**
   * Download invitation letter PDF
   */
  async downloadInvitation(invitationId: string): Promise<Blob> {
    return apiDownload(`/v1/invitations/${invitationId}/download/`);
  },

  /**
   * Regenerate invitation letter
   */
  async regenerateInvitation(invitationId: string, reason: string): Promise<InvitationLetter> {
    return api.post<InvitationLetter>(`/v1/invitations/${invitationId}/regenerate/`, { reason });
  },
};

export default invitationsService;
