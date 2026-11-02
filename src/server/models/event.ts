import { model, models, Schema } from 'mongoose';
import { EVENT_MODERATION_STATUSES, EVENT_STATUSES } from '@/constants';
import { requiredString } from '@/lib/validators';
import type { Event } from '@/types/models';

const eventSchema = new Schema<Event>(
  {
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
      index: true,
    },
    slug: { ...requiredString, unique: true, lowercase: true, index: true },
    title: requiredString,
    shortDescription: { type: String, trim: true },
    description: requiredString,
    bannerImageUrl: requiredString,
    seatMapMode: {
      type: String,
      enum: ['DEFAULT', 'UPLOAD', 'NONE'],
      default: 'DEFAULT',
    },
    seatMapImageUrl: { type: String, trim: true },
    location: requiredString,
    venueName: requiredString,
    venueAddress: requiredString,
    city: requiredString,
    terms: requiredString,
    category: { type: String, trim: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    guestCheckoutEnabled: { type: Boolean, default: false },
    moderationStatus: {
      type: String,
      enum: EVENT_MODERATION_STATUSES,
      default: 'NOT_SUBMITTED',
    },
    status: { type: String, enum: EVENT_STATUSES, default: 'DRAFT' },
  },
  { collection: 'events', timestamps: true },
);

eventSchema.pre('validate', function validateEventTimes() {
  if (this.startsAt && this.endsAt && this.endsAt <= this.startsAt) {
    this.invalidate('endsAt', 'endsAt must be after startsAt');
  }
});

export const EventModel = models.Event || model<Event>('Event', eventSchema);
