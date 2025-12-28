/**
 * Documents Service
 * Handles document-related API calls
 */

import { api, apiDownload } from '../api';
import type { Document, DocumentType, PaginatedResponse } from '../types';

export const documentsService = {
  /**
   * Get document types
   */
  async getDocumentTypes(): Promise<DocumentType[]> {
    const response = await api.get<PaginatedResponse<DocumentType>>('/v1/documents/types/');
    return response.results;
  },

  /**
   * Get all documents for current country
   */
  async getDocuments(): Promise<PaginatedResponse<Document>> {
    return api.get<PaginatedResponse<Document>>('/v1/documents/');
  },

  /**
   * Upload a document
   */
  async uploadDocument(
    documentTypeId: string,
    file: File,
    participantId?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentTypeId);
    if (participantId) {
      formData.append('participant', participantId);
    }
    return api.upload<Document>('/v1/documents/upload/', formData);
  },

  /**
   * Download a document
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    return apiDownload(`/v1/documents/${documentId}/download/`);
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    return api.delete(`/v1/documents/${documentId}/`);
  },

  /**
   * Get document requirements for a participant
   */
  async getParticipantRequirements(participantId: string): Promise<{
    required: DocumentType[];
    uploaded: Document[];
    missing: DocumentType[];
  }> {
    return api.get(`/v1/documents/participant/${participantId}/requirements/`);
  },
};

export default documentsService;
