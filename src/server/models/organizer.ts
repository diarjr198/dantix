import { model, models, Schema } from 'mongoose';
import { ORGANIZER_VERIFICATION_STATUSES } from '@/constants';
import { requiredString } from '@/lib/validators';
import type { Organizer } from '@/types/models';

const organizerSchema = new Schema<Organizer>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
      unique: true,
    },
    name: requiredString,
    description: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },
    logoImageUrl: { type: String, trim: true },
    verificationStatus: {
      type: String,
      enum: ORGANIZER_VERIFICATION_STATUSES,
      default: 'PENDING',
    },
  },
  { collection: 'organizers', timestamps: true },
);

export const OrganizerModel =
  models.Organizer || model<Organizer>('Organizer', organizerSchema);
