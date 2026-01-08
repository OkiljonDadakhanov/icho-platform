/**
 * Services Index
 * Export all services from a single file
 */

export { authService } from './auth';
export { preRegistrationService } from './pre-registration';
export { participantsService } from './participants';
export { paymentsService } from './payments';
export { travelService } from './travel';
export { documentsService } from './documents';
export { invitationsService } from './invitations';
export { workflowService } from './workflow';
export { notificationsService } from './notifications';
export { countriesService } from './countries';

// Re-export types from services
export type { ParticipantSummary } from './participants';
export type { InvitationStatus } from './invitations';
