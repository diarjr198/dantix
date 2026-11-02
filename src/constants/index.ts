export const ORGANIZER_VERIFICATION_STATUSES = [
  'PENDING',
  'VERIFIED',
  'REJECTED',
] as const;
export const EVENT_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'CANCELLED',
  'COMPLETED',
] as const;
export const EVENT_MODERATION_STATUSES = [
  'NOT_SUBMITTED',
  'IN_REVIEW',
  'APPROVED',
  'CHANGES_REQUIRED',
  'REJECTED',
] as const;
export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'EXPIRED',
  'CANCELLED',
] as const;
export const PAYMENT_STATUSES = [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'EXPIRED',
  'REVIEW',
] as const;
export const USER_ROLES = ['ADMIN', 'ORGANIZER', 'CUSTOMER', 'GATE'] as const;
export const TICKET_STATUSES = ['ACTIVE', 'USED', 'VOID'] as const;
export const QR_STATUSES = ['WAITING', 'READY', 'REVOKED'] as const;
export const EVENT_STAFF_ROLES = ['MANAGER', 'CHECKIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type OrganizerVerificationStatus =
  (typeof ORGANIZER_VERIFICATION_STATUSES)[number];
export type EventStatus = (typeof EVENT_STATUSES)[number];
export type EventModerationStatus = (typeof EVENT_MODERATION_STATUSES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type QrStatus = (typeof QR_STATUSES)[number];
export type EventStaffRole = (typeof EVENT_STAFF_ROLES)[number];
