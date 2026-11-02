import { model, models, Schema } from 'mongoose';
import {
  EVENT_STAFF_ROLES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  QR_STATUSES,
  TICKET_STATUSES,
} from '@/constants';
import { idrAmount, positiveInteger, requiredString } from '@/lib/validators';
import type {
  Checkin,
  CheckinSession,
  EventStaff,
  Order,
  OrderItem,
  Payment,
  Ticket,
} from '@/types/models';

const ref = (name: string) => ({
  type: Schema.Types.ObjectId,
  ref: name,
  required: true,
  index: true,
});
const money = { ...idrAmount, default: 0 };

const participantSchema = new Schema(
  {
    name: requiredString,
    email: requiredString,
    phone: requiredString,
    domicile: requiredString,
    identityNumber: { ...requiredString, select: false },
    ticketTypeId: ref('TicketType'),
  },
  { _id: false },
);

const orderSchema = new Schema<Order>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    eventId: ref('Event'),
    bookingCode: { ...requiredString, unique: true },
    contactName: requiredString,
    contactEmail: requiredString,
    contactPhone: requiredString,
    subtotal: idrAmount,
    discount: money,
    tax: money,
    serviceFee: money,
    paymentFee: money,
    total: idrAmount,
    status: { type: String, enum: ORDER_STATUSES, default: 'PENDING' },
    expiresAt: { type: Date, required: true },
    paidAt: Date,
    participants: { type: [participantSchema], required: true },
  },
  { collection: 'orders', timestamps: true },
);
orderSchema.index({ eventId: 1, status: 1, expiresAt: 1 });
orderSchema.pre('validate', function validateOrder() {
  if (this.expiresAt && this.createdAt && this.expiresAt <= this.createdAt)
    this.invalidate('expiresAt', 'expiresAt must be after creation');
  if (this.discount > this.subtotal)
    this.invalidate('discount', 'discount cannot exceed subtotal');
  if (
    this.total !==
    this.subtotal - this.discount + this.tax + this.serviceFee + this.paymentFee
  )
    this.invalidate('total', 'total does not match order amounts');
});

const orderItemSchema = new Schema<OrderItem>(
  {
    orderId: ref('Order'),
    eventId: ref('Event'),
    ticketTypeId: ref('TicketType'),
    quantity: positiveInteger,
    unitPrice: idrAmount,
    lineTotal: idrAmount,
  },
  { collection: 'order_items', timestamps: true },
);
orderItemSchema.index({ orderId: 1, ticketTypeId: 1 }, { unique: true });
orderItemSchema.pre('validate', function validateLine() {
  if (this.lineTotal !== this.quantity * this.unitPrice)
    this.invalidate(
      'lineTotal',
      'lineTotal must equal quantity times unitPrice',
    );
});

const paymentSchema = new Schema<Payment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    provider: requiredString,
    providerReference: requiredString,
    method: requiredString,
    amount: idrAmount,
    status: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING' },
    paidAt: Date,
  },
  { collection: 'payments', timestamps: true },
);
paymentSchema.index({ provider: 1, providerReference: 1 }, { unique: true });
paymentSchema.index(
  { orderId: 1 },
  { unique: true, partialFilterExpression: { status: 'SUCCEEDED' } },
);
paymentSchema.pre('validate', function validatePaidAt() {
  if (this.status === 'SUCCEEDED' && !this.paidAt)
    this.invalidate('paidAt', 'paidAt is required for succeeded payments');
});

const ticketSchema = new Schema<Ticket>(
  {
    orderItemId: ref('OrderItem'),
    eventId: ref('Event'),
    ticketSequence: positiveInteger,
    attendeeName: requiredString,
    attendeeEmail: { type: String, trim: true },
    attendeePhone: { type: String, trim: true },
    attendeeDomicile: { type: String, trim: true },
    attendeeIdentityNumber: { type: String, trim: true, select: false },
    qrTokenHash: { type: String, trim: true },
    qrTokenCiphertext: { type: String, select: false },
    qrTokenIv: { type: String, select: false },
    qrTokenAuthTag: { type: String, select: false },
    qrIssuedAt: Date,
    qrStatus: { type: String, enum: QR_STATUSES, default: 'WAITING' },
    status: { type: String, enum: TICKET_STATUSES, default: 'ACTIVE' },
    issuedAt: { type: Date, required: true },
    checkedInAt: Date,
    checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { collection: 'tickets', timestamps: true },
);
ticketSchema.index({ orderItemId: 1, ticketSequence: 1 }, { unique: true });
ticketSchema.index(
  { qrTokenHash: 1 },
  {
    unique: true,
    partialFilterExpression: { qrTokenHash: { $type: 'string' } },
  },
);
ticketSchema.pre('validate', function validateQr() {
  if (this.qrStatus === 'READY' && !this.qrTokenHash)
    this.invalidate('qrTokenHash', 'READY tickets need qrTokenHash');
  if (this.status === 'VOID' && this.qrStatus !== 'REVOKED')
    this.invalidate('qrStatus', 'VOID tickets need REVOKED qrStatus');
});

const sessionSchema = new Schema<CheckinSession>(
  {
    eventId: ref('Event'),
    name: requiredString,
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
  },
  { collection: 'checkin_sessions', timestamps: true },
);
sessionSchema.pre('validate', function validateSession() {
  if (this.endsAt <= this.startsAt)
    this.invalidate('endsAt', 'endsAt must be after startsAt');
});
const staffSchema = new Schema<EventStaff>(
  {
    eventId: ref('Event'),
    userId: ref('User'),
    role: { type: String, enum: EVENT_STAFF_ROLES, required: true },
    active: { type: Boolean, default: true },
  },
  { collection: 'event_staff', timestamps: true },
);
staffSchema.index({ eventId: 1, userId: 1 }, { unique: true });
const checkinSchema = new Schema<Checkin>(
  {
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    eventId: ref('Event'),
    staffUserId: ref('User'),
    checkedInAt: { type: Date, required: true },
  },
  { collection: 'checkins', timestamps: true },
);
checkinSchema.index({ ticketId: 1 }, { unique: true });

export const OrderModel = models.Order || model<Order>('Order', orderSchema);
export const OrderItemModel =
  models.OrderItem || model<OrderItem>('OrderItem', orderItemSchema);
export const PaymentModel =
  models.Payment || model<Payment>('Payment', paymentSchema);
export const TicketModel =
  models.Ticket || model<Ticket>('Ticket', ticketSchema);
export const CheckinSessionModel =
  models.CheckinSession ||
  model<CheckinSession>('CheckinSession', sessionSchema);
export const EventStaffModel =
  models.EventStaff || model<EventStaff>('EventStaff', staffSchema);
export const CheckinModel =
  models.Checkin || model<Checkin>('Checkin', checkinSchema);
