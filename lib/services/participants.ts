/**
 * Participants Service
 * Handles participant-related API calls
 */

import { api } from '../api';
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
   * Create new participant
   */
  async createParticipant(data: ParticipantCreateRequest): Promise<Participant> {
    return api.post<Participant>('/v1/participants/', data);
  },

  /**
   * Update participant
   */
  async updateParticipant(id: string, data: ParticipantUpdateRequest): Promise<Participant> {
    return api.patch<Participant>(`/v1/participants/${id}/`, data);
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
    return api.upload<Participant>(`/v1/participants/${participantId}/photo/`, formData);
  },

  /**
   * Upload participant passport scan
   */
  async uploadPassportScan(participantId: string, file: File): Promise<Participant> {
    const formData = new FormData();
    formData.append('passport_scan', file);
    return api.upload<Participant>(`/v1/participants/${participantId}/passport/`, formData);
  },
};

export default participantsService;
