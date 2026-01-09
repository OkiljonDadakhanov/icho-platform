/**
 * TypeScript types for IChO 2026 API
 * These types match the Django backend models
 */

// Enums matching backend
export type ParticipantRole =
  | 'TEAM_LEADER'
  | 'CONTESTANT'
  | 'OBSERVER'
  | 'GUEST'
  | 'MENTOR'
  | 'HEAD_MENTOR';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type TshirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type DietaryRequirement = 'NORMAL' | 'HALAL' | 'VEGETARIAN' | 'VEGAN' | 'KOSHER';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type WorkflowStage =
  | 'PRE_REGISTRATION'
  | 'PAYMENT'
  | 'PARTICIPANTS'
  | 'TRAVEL'
  | 'INVITATIONS';

export type StageStatus = 'OPEN' | 'COMPLETED' | 'LOCKED';

export type VisaStatus =
  | 'NOT_REQUIRED'
  | 'REQUIRED'
  | 'APPLIED'
  | 'APPROVED'
  | 'REJECTED';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type InvitationStatus = 'PENDING' | 'GENERATING' | 'GENERATED' | 'FAILED';

export interface FeeRule {
  id: string;
  role: ParticipantRole;
  unit_fee: number;
  currency: string;
  is_active: boolean;
}

// API Response Types
export interface User {
  id: string;
  country: Country | null;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  iso_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coordinator {
  id: string;
  country: string;
  full_name: string;
  role: string;
  gender: Gender;
  date_of_birth: string;
  passport_number: string;
  passport_scan?: string;
  email: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreRegistration {
  id: string;
  country: string;
  num_team_leaders: number;
  num_contestants: number;
  num_observers: number;
  num_guests: number;
  fee_total: number;
  fee_breakdown: Record<string, number>;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  coordinators?: Coordinator[];
  can_edit?: boolean;
  edit_blocked_reason?: string | null;
}

export interface Participant {
  id: string;
  country: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  gender: Gender;
  date_of_birth: string;
  passport_number: string;
  passport_scan?: string;
  passport_expiry?: string;
  profile_photo?: string;
  role: ParticipantRole;
  tshirt_size: TshirtSize;
  dietary_requirements: DietaryRequirement;
  medical_requirements?: string;
  email: string;
  consent_form_signed?: string;
  regulations_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student extends Participant {
  school_name: string;
  school_city: string;
  grade_level: number;
  previous_icho_count: number;
  national_olympiad_rank?: number;
  guardian_name?: string;
  guardian_email?: string;
  guardian_phone?: string;
}

export interface Invoice {
  id: string;
  country: string;
  number: string;
  amount: number;
  currency: string;
  pdf_file?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  country?: string;
  invoice?: Invoice;
  proof_file?: string;
  status: PaymentStatus;
  admin_comment?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface TravelInfo {
  id: string;
  participant: string;
  arrival_datetime: string;
  departure_datetime: string;
  flight_number?: string;
  airline?: string;
  ticket_file?: string;
  created_at: string;
  updated_at: string;
}

export interface VisaInformation {
  id: string;
  participant: string;
  visa_status: VisaStatus;
  embassy_location?: string;
  appointment_date?: string;
  invitation_letter_requested: boolean;
  invitation_letter_sent: boolean;
  invitation_letter_sent_date?: string;
  notes?: string;
}

export interface AccommodationPreference {
  id: string;
  participant: string;
  room_type: 'SINGLE' | 'DOUBLE' | 'TWIN';
  preferred_roommate?: string;
  accessibility_requirements?: string;
  early_check_in: boolean;
  late_check_out: boolean;
  additional_nights_before: number;
  additional_nights_after: number;
  notes?: string;
  created_at: string;
}

export interface DocumentType {
  id: string;
  name: string;
  code: string;
  description: string;
  allowed_extensions: string[];
  max_file_size_mb: number;
  required_for: string[];
  stage: WorkflowStage;
  is_active: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  document_type: string;
  participant?: string;
  country: string;
  file: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  status: DocumentStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  uploaded_by: string;
  created_at: string;
}

export interface InvitationLetter {
  id: string;
  participant: string;
  template: string;
  pdf_file?: string;
  letter_number: string;
  status: InvitationStatus;
  generated_at?: string;
  generated_by?: string;
  is_regeneration: boolean;
  regeneration_count: number;
  regeneration_reason?: string;
  created_at: string;
}

export interface StageDeadline {
  id: string;
  stage: WorkflowStage;
  deadline_at: string;
  created_at: string;
  updated_at: string;
}

export interface CountryStageStatus {
  id: string;
  country: string;
  stage: WorkflowStage;
  status: StageStatus;
  unlocked_until?: string;
  unlock_reason?: string;
  unlocked_by?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user: string;
  template?: string;
  channel: 'EMAIL' | 'SYSTEM';
  subject: string;
  body: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'READ';
  sent_at?: string;
  read_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor?: string;
  country?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_json?: Record<string, unknown>;
  after_json?: Record<string, unknown>;
  reason?: string;
  created_at: string;
}

// API Request Types
export interface LoginRequest {
  country: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface PreRegistrationUpdateRequest {
  num_team_leaders: number;
  num_contestants: number;
  num_observers: number;
  num_guests: number;
}

export interface CoordinatorUpsertRequest {
  full_name: string;
  role: string;
  gender: Gender;
  date_of_birth: string;
  passport_number: string;
  email: string;
  phone: string;
  is_primary?: boolean;
}

export interface ParticipantCreateRequest {
  full_name: string;
  gender: Gender;
  date_of_birth: string;
  passport_number: string;
  role: ParticipantRole;
  tshirt_size: TshirtSize;
  dietary_requirements: DietaryRequirement;
  medical_requirements?: string;
  email: string;
  passport_scan?: File;
  profile_photo?: File;
  consent_form_signed?: File;
  regulations_accepted: boolean;
}

export interface ParticipantUpdateRequest extends Partial<ParticipantCreateRequest> {}

export interface TravelInfoRequest {
  participant_id: string;
  arrival_datetime: string;
  departure_datetime: string;
  flight_number?: string;
  airline?: string;
}

// Paginated Response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Dashboard Progress
export interface DelegationProgress {
  current_stage: WorkflowStage;
  stages: {
    stage: WorkflowStage;
    status: StageStatus;
    deadline?: string;
  }[];
  participant_count: {
    total: number;
    team_leaders: number;
    contestants: number;
    observers: number;
    guests: number;
  };
}

// Helper function to map frontend role to backend role
export function mapRoleToBackend(frontendRole: string): ParticipantRole {
  const mapping: Record<string, ParticipantRole> = {
    'Team Leader': 'TEAM_LEADER',
    'Deputy Leader': 'TEAM_LEADER',
    'Contestant': 'CONTESTANT',
    'Observer': 'OBSERVER',
    'Guest': 'GUEST',
    'IC Member': 'OBSERVER',
    'ISC Member': 'OBSERVER',
    'ITC Member': 'OBSERVER',
  };
  return mapping[frontendRole] || 'GUEST';
}

// Helper function to map backend role to frontend role
export function mapRoleToFrontend(backendRole: ParticipantRole): string {
  const mapping: Record<ParticipantRole, string> = {
    'TEAM_LEADER': 'Team Leader',
    'CONTESTANT': 'Contestant',
    'OBSERVER': 'Observer',
    'GUEST': 'Guest',
    'MENTOR': 'Mentor',
    'HEAD_MENTOR': 'Head Mentor',
  };
  return mapping[backendRole] || 'Guest';
}

// Helper function to map gender
export function mapGenderToBackend(gender: string): Gender {
  const mapping: Record<string, Gender> = {
    'Male': 'MALE',
    'Female': 'FEMALE',
    'Other': 'OTHER',
  };
  return mapping[gender] || 'OTHER';
}

export function mapGenderToFrontend(gender: Gender): string {
  const mapping: Record<Gender, string> = {
    'MALE': 'Male',
    'FEMALE': 'Female',
    'OTHER': 'Other',
  };
  return mapping[gender] || 'Other';
}

// Helper function to map dietary
export function mapDietaryToBackend(dietary: string): DietaryRequirement {
  const mapping: Record<string, DietaryRequirement> = {
    'normal': 'NORMAL',
    'halal': 'HALAL',
    'vegetarian': 'VEGETARIAN',
    'vegan': 'VEGAN',
    'kosher': 'KOSHER',
  };
  return mapping[dietary.toLowerCase()] || 'NORMAL';
}

export function mapDietaryToFrontend(dietary: DietaryRequirement): string {
  const mapping: Record<DietaryRequirement, string> = {
    'NORMAL': 'normal',
    'HALAL': 'halal',
    'VEGETARIAN': 'vegetarian',
    'VEGAN': 'vegan',
    'KOSHER': 'kosher',
  };
  return mapping[dietary] || 'normal';
}

// Helper function to map tshirt size
export function mapTshirtToBackend(size: string): TshirtSize {
  return size.toUpperCase() as TshirtSize;
}

export function mapTshirtToFrontend(size: TshirtSize): string {
  return size;
}
