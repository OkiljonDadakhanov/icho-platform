/**
 * Notifications Service
 * Handles notification-related API calls
 */

import { api } from '../api';
import type { Notification, PaginatedResponse } from '../types';

export const notificationsService = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(): Promise<PaginatedResponse<Notification>> {
    return api.get<PaginatedResponse<Notification>>('/v1/notifications/');
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return api.get<{ count: number }>('/v1/notifications/unread-count/');
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return api.post<Notification>(`/v1/notifications/${notificationId}/read/`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    return api.post('/v1/notifications/mark-all-read/');
  },
};

export default notificationsService;
