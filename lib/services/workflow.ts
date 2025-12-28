/**
 * Workflow Service
 * Handles workflow and dashboard API calls
 */

import { api } from '../api';
import type { DelegationProgress, StageDeadline, CountryStageStatus } from '../types';

export const workflowService = {
  /**
   * Get delegation progress for dashboard
   */
  async getDelegationProgress(): Promise<DelegationProgress> {
    return api.get<DelegationProgress>('/v1/workflow/dashboard/progress/');
  },

  /**
   * Get stage deadlines
   */
  async getStageDeadlines(): Promise<StageDeadline[]> {
    return api.get<StageDeadline[]>('/v1/workflow/deadlines/');
  },

  /**
   * Get country stage statuses
   */
  async getCountryStageStatuses(): Promise<CountryStageStatus[]> {
    return api.get<CountryStageStatus[]>('/v1/workflow/stages/');
  },
};

export default workflowService;
