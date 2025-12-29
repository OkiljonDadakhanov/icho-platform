/**
 * Payments Service
 * Handles payment-related API calls
 */

import { api, apiDownload } from '../api';
import type { Payment, Invoice } from '../types';

export const paymentsService = {
  /**
   * Get payment details for current country (includes invoice)
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
   * Get invoice details (extracted from payment)
   */
  async getInvoice(): Promise<Invoice | null> {
    try {
      const payment = await api.get<Payment>('/v1/payments/');
      return payment?.invoice || null;
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
   * Regenerate invoice with updated data
   */
  async regenerateInvoice(): Promise<Payment> {
    return api.post<Payment>('/v1/payments/invoice/regenerate/');
  },

  /**
   * Get payment status
   */
  async getPaymentStatus(): Promise<{ status: string; message: string }> {
    const payment = await this.getPayment();
    return {
      status: payment?.status || 'NOT_FOUND',
      message: payment?.status === 'APPROVED'
        ? 'Payment approved'
        : payment?.status === 'REJECTED'
        ? 'Payment rejected'
        : 'Payment pending verification'
    };
  },
};

export default paymentsService;
