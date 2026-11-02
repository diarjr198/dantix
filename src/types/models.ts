import type { Types } from 'mongoose';
import type {
  EventModerationStatus,
  EventStaffRole,
  EventStatus,
  OrderStatus,
  OrganizerVerificationStatus,
  PaymentStatus,
  QrStatus,
  TicketStatus,
  UserRole,
} from '@/constants';

export interface TimestampedDocument {
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends TimestampedDocument {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  isAdmin: boolean;
  role: UserRole;
  active: boolean;
}

export interface SiteSettings extends TimestampedDocument {
  key: string;
  siteName: string;
  logoUrl?: string;
  address?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutDescription: string;
  contactEmail?: string;
  contactPhone?: string;
  instagramUrl?: string;
  xUrl?: string;
  facebookUrl?: string;
}

export interface Faq extends TimestampedDocument {
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
}

export interface Organizer extends TimestampedDocument {
  ownerUserId: Types.ObjectId;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  logoImageUrl?: string;
  verificationStatus: OrganizerVerificationStatus;
}

export interface Event extends TimestampedDocument {
  organizerId: Types.ObjectId;
  slug: string;
  title: string;
  shortDescription?: string;
  description: string;
  bannerImageUrl: string;
  seatMapMode: 'DEFAULT' | 'UPLOAD' | 'NONE';
  seatMapImageUrl?: string;
  location: string;
  venueName: string;
  venueAddress: string;
  city: string;
  terms: string;
  category?: string;
  startsAt: Date;
  endsAt: Date;
  guestCheckoutEnabled: boolean;
  moderationStatus: EventModerationStatus;
  status: EventStatus;
}

export interface TicketType extends TimestampedDocument {
  eventId: Types.ObjectId;
  name: string;
  price: number;
  quota: number;
  maxPerOrder: number;
  salesStartAt: Date;
  salesEndAt: Date;
  reservedQuantity: number;
  soldQuantity: number;
  benefits: string[];
  sortOrder: number;
}

export interface Order extends TimestampedDocument {
  userId?: Types.ObjectId;
  eventId: Types.ObjectId;
  bookingCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  subtotal: number;
  discount: number;
  tax: number;
  serviceFee: number;
  paymentFee: number;
  total: number;
  status: OrderStatus;
  expiresAt: Date;
  paidAt?: Date;
  participants: Array<{
    name: string;
    email: string;
    phone: string;
    domicile: string;
    identityNumber: string;
    ticketTypeId: Types.ObjectId;
  }>;
}

export interface OrderItem extends TimestampedDocument {
  orderId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Payment extends TimestampedDocument {
  orderId: Types.ObjectId;
  provider: string;
  providerReference: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
}

export interface Ticket extends TimestampedDocument {
  orderItemId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketSequence: number;
  attendeeName: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  attendeeDomicile?: string;
  attendeeIdentityNumber?: string;
  qrTokenHash?: string;
  qrTokenCiphertext?: string;
  qrTokenIv?: string;
  qrTokenAuthTag?: string;
  qrIssuedAt?: Date;
  qrStatus: QrStatus;
  status: TicketStatus;
  issuedAt: Date;
  checkedInAt?: Date;
  checkedInBy?: Types.ObjectId;
}

export interface CheckinSession extends TimestampedDocument {
  eventId: Types.ObjectId;
  name: string;
  startsAt: Date;
  endsAt: Date;
}

export interface EventStaff extends TimestampedDocument {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  role: EventStaffRole;
  active: boolean;
}

export interface Checkin extends TimestampedDocument {
  ticketId: Types.ObjectId;
  eventId: Types.ObjectId;
  staffUserId: Types.ObjectId;
  checkedInAt: Date;
}
