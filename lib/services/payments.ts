/**
 * Payments Service
 * Handles payment-related API calls
 */

import { api, apiDownload } from '../api';
import type { Payment, Invoice } from '../types';

export const paymentsService = {
  /**
   * Get payment details for current country
   */
  async getPayment(): Promise<Payment | null> {
    try {
      return await api.get<Payment>('/v1/payments/');
    } catch (error) {
      // Return null if no payment exists yet
      if ((error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get invoice details
   */
  async getInvoice(): Promise<Invoice | null> {
    try {
      return await api.get<Invoice>('/v1/payments/invoice/');
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Download invoice PDF
   */
  async downloadInvoice(): Promise<Blob> {
    return apiDownload('/v1/payments/invoice/download/');
  },

  /**
   * Upload payment proof
   */
  async uploadPaymentProof(file: File): Promise<Payment> {
    const formData = new FormData();
    formData.append('proof_file', file);
    return api.upload<Payment>('/v1/payments/upload-proof/', formData);
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(): Promise<{ status: string; message: string }> {
    return api.get('/v1/payments/status/');
  },
};

export default paymentsService;
