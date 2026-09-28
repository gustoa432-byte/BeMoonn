/**
 * BE&MOON Domain Model Types
 * Pure "One Person = One User" Architecture
 *
 * Concepts:
 * - There are NO account types or roles (no 'client' / 'master' roles).
 * - Only User exists.
 * - Professional specialization is a capability layer on top of User.
 * - References describe desires and orientation (can be private or public).
 * - Works describe creative execution (usually public).
 * - Client / Provider are dynamic relationships between Users for specific services.
 */

export interface BookingDestination {
  type: 'external' | 'dikidi' | 'telegram' | 'whatsapp' | 'phone';
  url: string;
  label: string;
}

export interface Place {
  id: string;
  owner_id: string; // User who owns / works at the place
  place_name: string;
  city: string;
  address: string;
  booking_url?: string;
  is_current: boolean;
  created_at: string;
}

export interface ProfessionalHistoryItem {
  id: string;
  user_id: string;
  period: string; // e.g. "2024–2026" or "2026–наст. время"
  place_name: string;
  city: string;
  role_title: string;
  is_current: boolean;
  created_at: string;
}

export interface MasterEducationItem {
  id: string;
  school_id: string;
  school_name: string;
  school_logo?: string;
  course_id: string;
  course_title: string;
  certificate_id: string;
  certificate_number: string;
  verification_token: string;
  issued_at: string;
  status: 'verified' | 'revoked';
}

/**
 * Professional capability layer:
 * Appears dynamically when a User chooses a supported profession.
 * Not a separate account or role.
 */
export interface ProfessionalProfile {
  profession: string; // e.g. "Barber", "Nail Artist", "Lashmaker", "Colorist"
  title?: string;
  city?: string;
  place?: Place;
  booking_destination: BookingDestination;
  specializations: string[];
  professional_history: ProfessionalHistoryItem[];
  education?: MasterEducationItem[];
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar: string;
  bio?: string;
  created_at: string;
  followers_count?: number;
  has_school?: boolean;
  // Professional capability layer (optional)
  professional?: ProfessionalProfile;
}

export interface MediaItem {
  id: string;
  owner_id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string;
  width: number;
  height: number;
  mime_type: string;
  alt?: string;
  fallback_color?: string;
}

export interface Reference {
  id: string;
  author_id: string; // User ID
  author_name: string;
  source_type: 'user_upload' | 'curated';
  source_url?: string;
  media: MediaItem[];
  title: string;
  category: string;
  tags: string[];
  is_private?: boolean; // Entity-level privacy
  created_at: string;
}

export type WorkStatus = 'published' | 'hidden' | 'deleted' | 'pending_consent';

export type ConsentStatus = 'not_required' | 'pending' | 'granted' | 'rejected';

export interface WorkConsentPermissions {
  save_to_history: boolean;
  publish_photo: boolean;
  show_client_name: boolean;
}

export interface WorkConsentRequest {
  id: string;
  work_id: string;
  work_title: string;
  work_image: string;
  provider_user_id: string; // User who performed the service
  provider_name: string;
  provider_avatar?: string;
  client_user_id: string; // User who received the service
  client_name: string;
  client_avatar?: string;
  reference_id?: string;
  reference_title?: string;
  reference_image?: string;
  status: ConsentStatus;
  permissions: WorkConsentPermissions;
  created_at: string;
  responded_at?: string;
}

export interface ClientHistoryItem {
  id: string;
  client_user_id: string; // Client User
  provider_user_id: string; // Provider User
  provider_name: string;
  provider_profession?: string;
  provider_avatar?: string;
  provider_city?: string;
  provider_booking: BookingDestination;
  work_id: string;
  work_title: string;
  work_price: number;
  work_duration: number;
  photo_url: string;
  reference_id?: string;
  reference_title?: string;
  reference_image?: string;
  performed_at: string;
  date_formatted?: string;
  consent_status: ConsentStatus;
  confirmed_by_client: boolean;
  can_repeat: boolean;
  want_request_id?: string;
  note?: string;
  created_at: string;
}

export interface Work {
  id: string;
  author_id: string; // User ID of creator/provider
  master_id?: string; // alias for author_id
  author_name?: string;
  master_name?: string; // alias for author_name
  author_profession?: string;
  master_profession?: string; // alias for author_profession
  author_avatar?: string;
  master_avatar?: string; // alias for author_avatar
  reference_id: string;
  reference_title?: string;
  reference_image?: string;
  before_image?: string;
  after_image?: string;
  rating?: number;
  rating_count?: number;
  distance_km?: number;
  is_portfolio_model?: boolean;
  client_user_id?: string; // Client User ID if tied to a visit
  client_name?: string;
  performed_at?: string;
  title: string;
  description: string;
  category: string;
  specializations: string[];
  price: number;
  duration: number; // in minutes
  media: MediaItem[];
  status: WorkStatus;
  consent_status?: ConsentStatus;
  confirmed_by_client?: boolean;
  want_request_id?: string;
  is_private_history_only?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  id: string;
  follower_id: string; // User ID
  followed_user_id: string; // User ID
  created_at: string;
}

export type WantStatus = 'created' | 'seen' | 'completed' | 'cancelled';

export interface WantRequest {
  id: string;
  client_user_id: string; // User wanting the service
  client_id?: string; // alias
  user_id?: string; // alias
  client_name: string;
  client_avatar: string;
  client_contact?: string;
  client_note?: string;
  provider_user_id: string; // User offering the service
  master_id?: string; // alias
  provider_name: string;
  reference_id: string;
  reference_title: string;
  reference_image: string;
  work_id: string;
  work_title: string;
  work_price: number;
  work_duration: number;
  work_image: string;
  status: WantStatus;
  has_review?: boolean;
  completed_work_id?: string;
  completed_at?: string;
  repeat_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  client_user_id: string;
  client_name: string;
  client_avatar: string;
  provider_user_id: string;
  want_request_id: string;
  rating: number; // 1-5
  text: string;
  created_at: string;
  status: 'published' | 'hidden';
}

export type NotificationType =
  | 'want_created'
  | 'want_status'
  | 'new_follower'
  | 'new_review'
  | 'consent_request'
  | 'consent_response';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: 'want_request' | 'user' | 'review' | 'work' | 'consent_request';
  entity_id: string;
  is_read: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export type DomainEventType =
  | 'user.created'
  | 'user.profession_added'
  | 'work.created'
  | 'work.published'
  | 'work.consent_requested'
  | 'work.consent_granted'
  | 'work.consent_rejected'
  | 'work.added_to_client_history'
  | 'reference.created'
  | 'reference.viewed'
  | 'work.viewed'
  | 'user.viewed'
  | 'user.followed'
  | 'user.unfollowed'
  | 'want.created'
  | 'want.seen'
  | 'want.completed'
  | 'want.cancelled'
  | 'booking.clicked'
  | 'repeat_work.clicked'
  | 'booking.repeated'
  | 'client_history.viewed'
  | 'review.created';

export interface DomainEvent {
  id: string;
  actor_id: string;
  entity_type: string;
  entity_id: string;
  event_type: DomainEventType;
  metadata: Record<string, any>;
  created_at: string;
}

export interface FeedItemActions {
  liked?: boolean;
  following: boolean;
  can_want: boolean;
}

export interface FeedItemResponse {
  reference: Reference;
  works: Work[];
  author: User; // User with optional professional capability layer
  actions: FeedItemActions;
  item_index?: number;
}

export interface FeedResponse {
  items: FeedItemResponse[];
  next_cursor: string | null;
  next_offset?: number;
  has_more: boolean;
  total_count: number;
}

export interface FunnelStepMetric {
  step: string;
  name: string;
  count: number;
  conversionFromPrev: number;
  conversionFromFirst: number;
}

export interface FunnelAnalyticsResponse {
  totalImpressions: number;
  totalWants: number;
  referenceToWantRate: number;
  completedToRepeatRate?: number;
  totalCompleted?: number;
  totalRepeats?: number;
  steps: FunnelStepMetric[];
}

export interface TestDiagnosticStep {
  step: string;
  expected: string;
  actual: string;
  status: 'passed' | 'failed';
}

export interface AcceptanceTestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
  executionTimeMs: number;
  diagnosticSteps?: TestDiagnosticStep[];
}

// --- SCHOOL / COURSE DOMAIN ENTITIES ---
export interface SchoolInstructor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  bio?: string;
}

export interface School {
  id: string;
  owner_id: string; // User ID
  name: string;
  logo: string;
  cover_media: string;
  description: string;
  city: string;
  address: string;
  website: string;
  contact_url: string;
  booking_url: string;
  status: 'active' | 'pending' | 'suspended';
  specializations: string[];
  graduates_count: number;
  courses_count: number;
  instructors: SchoolInstructor[];
  created_at: string;
  updated_at: string;
}

export type CourseFormat = 'offline' | 'online' | 'hybrid';

export interface Course {
  id: string;
  school_id: string;
  school_name: string;
  title: string;
  description: string;
  format: CourseFormat;
  duration: string;
  price: number;
  next_cohort: string;
  specializations: string[];
  instructor_ids: string[];
  graduates_count: number;
  syllabus?: string[];
  created_at: string;
}

export type EnrollmentStatus =
  | 'invited'
  | 'registered'
  | 'enrolled'
  | 'in_progress'
  | 'completed'
  | 'verified'
  | 'revoked';

export interface Enrollment {
  id: string;
  school_id: string;
  course_id: string;
  course_title: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  status: EnrollmentStatus;
  started_at: string;
  completed_at?: string;
  verified_at?: string;
  verified_by?: string;
  certificate_id?: string;
  created_at: string;
}

export type CertificateStatus = 'issued' | 'revoked' | 'expired';

export interface Certificate {
  id: string;
  school_id: string;
  school_name: string;
  course_id: string;
  course_title: string;
  graduate_id: string; // User ID
  graduate_name: string;
  graduate_avatar: string;
  certificate_number: string;
  title: string;
  grade?: string;
  issued_at: string;
  status: CertificateStatus;
  verification_token: string;
  verification_url: string;
  document_url?: string;
  revoke_reason?: string;
  created_at: string;
}

export type SchoolPostType =
  | 'announcement'
  | 'course'
  | 'masterclass'
  | 'student_work'
  | 'school_life'
  | 'news';

export interface SchoolPost {
  id: string;
  school_id: string;
  school_name: string;
  school_logo: string;
  media: MediaItem[];
  title: string;
  text: string;
  type: SchoolPostType;
  course_id?: string;
  status: 'published' | 'hidden';
  created_at: string;
}

export interface SchoolGraduateView {
  user_id: string;
  master_id?: string; // alias for user_id
  name: string;
  profession: string;
  avatar: string;
  city: string;
  current_place?: string;
  certificate_number: string;
  verification_token: string;
  course_title: string;
  completed_at: string;
  works: Work[];
  followers_count: number;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value?: any;
  new_value?: any;
  reason?: string;
  created_at: string;
}
