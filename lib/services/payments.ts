/**
 * Payments Service
 * Handles payment-related API calls
 */

import { api, apiDownload } from '../api';
import { hasStatus } from '../error-utils';
import type { Payment, Invoice, SingleRoomInvoice } from '../types';

export const paymentsService = {
  /**
   * Get payment details for current country (includes invoice)
   */
  async getPayment(): Promise<Payment | null> {
    try {
      return await api.get<Payment>('/v1/payments/');
    } catch (error: unknown) {
      // Return null if no payment exists yet
      if (hasStatus(error) && error.status === 404) {
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
    } catch (error: unknown) {
      if (hasStatus(error) && error.status === 404) {
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

  /**
   * Get single room invoices for current country
   */
  async getSingleRoomInvoices(): Promise<SingleRoomInvoice[]> {
    try {
      const response = await api.get<{ invoices: SingleRoomInvoice[] }>('/v1/payments/single-room-invoices/');
      return response.invoices || [];
    } catch (error: unknown) {
      if (hasStatus(error) && error.status === 404) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Download single room invoice PDF
   */
  async downloadSingleRoomInvoice(invoiceId: string): Promise<Blob> {
    return apiDownload(`/v1/payments/single-room-invoices/${invoiceId}/download/`);
  },

  /**
   * Upload single room payment proof
   */
  async uploadSingleRoomProof(invoiceId: string, file: File): Promise<SingleRoomInvoice> {
    const formData = new FormData();
    formData.append('proof_file', file);
    return api.upload<SingleRoomInvoice>(`/v1/payments/single-room-invoices/${invoiceId}/upload-proof/`, formData);
  },
};

export default paymentsService;
