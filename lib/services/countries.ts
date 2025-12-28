/**
 * Countries Service
 * Handles country-related API calls
 */

import { api } from '../api';
import type { Country, PaginatedResponse } from '../types';

export const countriesService = {
  /**
   * Get all countries
   */
  async getCountries(): Promise<Country[]> {
    const response = await api.get<Country[] | PaginatedResponse<Country>>('/v1/countries/');
    // Handle both array and paginated responses
    if (Array.isArray(response)) {
      return response;
    }
    return response.results;
  },

  /**
   * Get country by ID
   */
  async getCountry(id: string): Promise<Country> {
    return api.get<Country>(`/v1/countries/${id}/`);
  },

  /**
   * Get country by ISO code
   */
  async getCountryByCode(isoCode: string): Promise<Country> {
    return api.get<Country>(`/v1/countries/by-code/${isoCode}/`);
  },
};

export default countriesService;
