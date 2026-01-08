/**
 * Countries Service
 * Handles country-related API calls
 */

import { api } from '../api';
import type { Country, PaginatedResponse } from '../types';

const fetchCountries = async (): Promise<Country[]> => {
  const response = await api.get<Country[] | PaginatedResponse<Country>>('/v1/countries/');
  if (Array.isArray(response)) {
    return response;
  }
  return response.results;
};

export const countriesService = {
  /**
   * Get all countries
   */
  async getCountries(): Promise<Country[]> {
    return fetchCountries();
  },

  /**
   * Get country by ID
   */
  async getCountry(id: string): Promise<Country> {
    const countries = await fetchCountries();
    const country = countries.find((item) => item.id === id);
    if (!country) {
      throw new Error('Country not found');
    }
    return country;
  },

  /**
   * Get country by ISO code
   */
  async getCountryByCode(isoCode: string): Promise<Country> {
    const countries = await fetchCountries();
    const normalized = isoCode.trim().toUpperCase();
    const country = countries.find((item) => item.iso_code.toUpperCase() === normalized);
    if (!country) {
      throw new Error('Country not found');
    }
    return country;
  },
};

export default countriesService;
