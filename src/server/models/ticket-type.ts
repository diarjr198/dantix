import { model, models, Schema } from 'mongoose';
import {
  idrAmount,
  nonNegativeInteger,
  positiveInteger,
  requiredString,
} from '@/lib/validators';
import type { TicketType } from '@/types/models';

const ticketTypeSchema = new Schema<TicketType>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: requiredString,
    price: idrAmount,
    quota: nonNegativeInteger,
    maxPerOrder: { ...positiveInteger, default: 10 },
    salesStartAt: { type: Date, required: true },
    salesEndAt: { type: Date, required: true },
    reservedQuantity: { ...nonNegativeInteger, default: 0 },
    soldQuantity: { ...nonNegativeInteger, default: 0 },
    benefits: { type: [String], default: [] },
    sortOrder: { ...nonNegativeInteger, default: 0 },
  },
  { collection: 'ticket_types', timestamps: true },
);

ticketTypeSchema.index({ eventId: 1, name: 1 }, { unique: true });

ticketTypeSchema.pre('validate', function validateSalesTimes() {
  if (
    this.salesStartAt &&
    this.salesEndAt &&
    this.salesEndAt <= this.salesStartAt
  ) {
    this.invalidate('salesEndAt', 'salesEndAt must be after salesStartAt');
  }
});

export const TicketTypeModel =
  models.TicketType || model<TicketType>('TicketType', ticketTypeSchema);
