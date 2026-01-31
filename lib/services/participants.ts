/**
 * Participants Service
 * Handles participant-related API calls
 */

import { api, apiDownload } from '../api';
import type {
  Participant,
  ParticipantCreateRequest,
  ParticipantUpdateRequest,
  PaginatedResponse,
} from '../types';

export interface ParticipantSummary {
  total: number;
  team_leaders: number;
  contestants: number;
  observers: number;
  guests: number;
}

export const participantsService = {
  /**
   * Get all participants for current country
   */
  async getParticipants(): Promise<PaginatedResponse<Participant>> {
    return api.get<PaginatedResponse<Participant>>('/v1/participants/');
  },

  /**
   * Get all participants without pagination
   */
  async getAllParticipants(): Promise<Participant[]> {
    const response = await api.get<PaginatedResponse<Participant>>('/v1/participants/?page_size=100');
    return response.results;
  },

  /**
   * Get participant by ID
   */
  async getParticipant(id: string): Promise<Participant> {
    return api.get<Participant>(`/v1/participants/${id}/`);
  },

  /**
   * Create new participant with files
   */
  async createParticipant(data: ParticipantCreateRequest): Promise<Participant> {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('gender', data.gender);
    formData.append('date_of_birth', data.date_of_birth);
    formData.append('passport_number', data.passport_number);
    formData.append('role', data.role);
    formData.append('tshirt_size', data.tshirt_size);
    formData.append('dietary_requirements', data.dietary_requirements);
    formData.append('email', data.email);
    formData.append('regulations_accepted', String(data.regulations_accepted));

    if (data.paternal_name) {
      formData.append('paternal_name', data.paternal_name);
    }
    if (data.badge_name) {
      formData.append('badge_name', data.badge_name);
    }
    if (data.other_dietary_requirements) {
      formData.append('other_dietary_requirements', data.other_dietary_requirements);
    }
    if (data.medical_requirements) {
      formData.append('medical_requirements', data.medical_requirements);
    }
    if (data.prefers_single_room !== undefined) {
      formData.append('prefers_single_room', String(data.prefers_single_room));
    }
    if (data.color_vision_deficiency) {
      formData.append('color_vision_deficiency', data.color_vision_deficiency);
    }
    if (data.translation_language) {
      formData.append('translation_language', data.translation_language);
    }
    if (data.passport_scan) {
      formData.append('passport_scan', data.passport_scan);
    }
    if (data.profile_photo) {
      formData.append('profile_photo', data.profile_photo);
    }
    if (data.consent_form_signed) {
      formData.append('consent_form_signed', data.consent_form_signed);
    }
    if (data.commitment_form_signed) {
      formData.append('commitment_form_signed', data.commitment_form_signed);
    }
    if (data.translation_language) {
      formData.append('translation_language', data.translation_language);
    }
    if (data.exam_language) {
      formData.append('exam_language', data.exam_language);
    }

    return api.upload<Participant>('/v1/participants/', formData);
  },

  /**
   * Update participant with files
   */
  async updateParticipant(id: string, data: ParticipantUpdateRequest): Promise<Participant> {
    const formData = new FormData();

    if (data.first_name !== undefined) formData.append('first_name', data.first_name);
    if (data.last_name !== undefined) formData.append('last_name', data.last_name);
    if (data.paternal_name !== undefined) formData.append('paternal_name', data.paternal_name);
    if (data.badge_name !== undefined) formData.append('badge_name', data.badge_name);
    if (data.gender !== undefined) formData.append('gender', data.gender);
    if (data.date_of_birth !== undefined) formData.append('date_of_birth', data.date_of_birth);
    if (data.passport_number !== undefined) formData.append('passport_number', data.passport_number);
    if (data.role !== undefined) formData.append('role', data.role);
    if (data.tshirt_size !== undefined) formData.append('tshirt_size', data.tshirt_size);
    if (data.dietary_requirements !== undefined) formData.append('dietary_requirements', data.dietary_requirements);
    if (data.other_dietary_requirements !== undefined) formData.append('other_dietary_requirements', data.other_dietary_requirements);
    if (data.email !== undefined) formData.append('email', data.email);
    if (data.medical_requirements !== undefined) formData.append('medical_requirements', data.medical_requirements);
    if (data.regulations_accepted !== undefined) formData.append('regulations_accepted', String(data.regulations_accepted));
    if (data.prefers_single_room !== undefined) formData.append('prefers_single_room', String(data.prefers_single_room));
    if (data.color_vision_deficiency !== undefined) formData.append('color_vision_deficiency', data.color_vision_deficiency);
    if (data.translation_language !== undefined) formData.append('translation_language', data.translation_language);
    if (data.passport_scan) formData.append('passport_scan', data.passport_scan);
    if (data.profile_photo) formData.append('profile_photo', data.profile_photo);
    if (data.consent_form_signed) formData.append('consent_form_signed', data.consent_form_signed);
    if (data.commitment_form_signed) formData.append('commitment_form_signed', data.commitment_form_signed);
    if (data.translation_language !== undefined) formData.append('translation_language', data.translation_language);
    if (data.exam_language !== undefined) formData.append('exam_language', data.exam_language);

    return api.uploadPatch<Participant>(`/v1/participants/${id}/`, formData);
  },

  /**
   * Delete participant
   */
  async deleteParticipant(id: string): Promise<void> {
    return api.delete(`/v1/participants/${id}/`);
  },

  /**
   * Get participant summary/count
   */
  async getParticipantSummary(): Promise<ParticipantSummary> {
    return api.get<ParticipantSummary>('/v1/participants/summary/');
  },

  /**
   * Upload participant profile photo
   */
  async uploadProfilePhoto(participantId: string, file: File): Promise<Participant> {
    const formData = new FormData();
    formData.append('profile_photo', file);
    return api.uploadPatch<Participant>(`/v1/participants/${participantId}/`, formData);
  },

  /**
   * Upload participant passport scan
   */
  async uploadPassportScan(participantId: string, file: File): Promise<Participant> {
    const formData = new FormData();
    formData.append('passport_scan', file);
    return api.uploadPatch<Participant>(`/v1/participants/${participantId}/`, formData);
  },

  /**
   * Download consent form template
   */
  async downloadConsentFormTemplate(): Promise<Blob> {
    return apiDownload('/v1/participants/templates/consent/download/');
  },

  /**
   * Download commitment form template (for students/contestants only)
   */
  async downloadCommitmentFormTemplate(): Promise<Blob> {
    return apiDownload('/v1/participants/templates/commitment/download/');
  },

  /**
   * Download team leader consent form template
   */
  async downloadTeamLeaderConsentFormTemplate(): Promise<Blob> {
    return apiDownload('/v1/participants/templates/consent-team-leader/download/');
  },
};

export default participantsService;
