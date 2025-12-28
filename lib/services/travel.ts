/**
 * Travel Service
 * Handles travel-related API calls
 */

import { api } from '../api';
import type {
  TravelInfo,
  TravelInfoRequest,
  VisaInformation,
  AccommodationPreference,
  PaginatedResponse,
} from '../types';

export const travelService = {
  /**
   * Get all travel info for current country
   */
  async getTravelInfo(): Promise<PaginatedResponse<TravelInfo>> {
    return api.get<PaginatedResponse<TravelInfo>>('/v1/travel/');
  },

  /**
   * Get all travel info without pagination
   */
  async getAllTravelInfo(): Promise<TravelInfo[]> {
    const response = await api.get<PaginatedResponse<TravelInfo>>('/v1/travel/?page_size=100');
    return response.results;
  },

  /**
   * Get travel info by ID
   */
  async getTravelInfoById(id: string): Promise<TravelInfo> {
    return api.get<TravelInfo>(`/v1/travel/${id}/`);
  },

  /**
   * Get travel info for a participant
   */
  async getParticipantTravel(participantId: string): Promise<TravelInfo | null> {
    try {
      return await api.get<TravelInfo>(`/v1/participants/${participantId}/travel/`);
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create or update travel info
   */
  async createTravelInfo(data: TravelInfoRequest): Promise<TravelInfo> {
    return api.post<TravelInfo>('/v1/travel/', data);
  },

  /**
   * Update travel info
   */
  async updateTravelInfo(id: string, data: Partial<TravelInfoRequest>): Promise<TravelInfo> {
    return api.patch<TravelInfo>(`/v1/travel/${id}/`, data);
  },

  /**
   * Delete travel info
   */
  async deleteTravelInfo(id: string): Promise<void> {
    return api.delete(`/v1/travel/${id}/`);
  },

  /**
   * Upload ticket file
   */
  async uploadTicket(travelId: string, file: File): Promise<TravelInfo> {
    const formData = new FormData();
    formData.append('ticket_file', file);
    return api.upload<TravelInfo>(`/v1/travel/${travelId}/ticket/`, formData);
  },

  /**
   * Get visa information
   */
  async getVisaInfo(): Promise<PaginatedResponse<VisaInformation>> {
    return api.get<PaginatedResponse<VisaInformation>>('/v1/travel/visa/');
  },

  /**
   * Update visa information
   */
  async updateVisaInfo(id: string, data: Partial<VisaInformation>): Promise<VisaInformation> {
    return api.patch<VisaInformation>(`/v1/travel/visa/${id}/`, data);
  },

  /**
   * Get accommodation preferences
   */
  async getAccommodation(): Promise<PaginatedResponse<AccommodationPreference>> {
    return api.get<PaginatedResponse<AccommodationPreference>>('/v1/travel/accommodation/');
  },

  /**
   * Update accommodation preference
   */
  async updateAccommodation(id: string, data: Partial<AccommodationPreference>): Promise<AccommodationPreference> {
    return api.patch<AccommodationPreference>(`/v1/travel/accommodation/${id}/`, data);
  },
};

export default travelService;
