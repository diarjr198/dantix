import { model, models, Schema } from 'mongoose';
import { requiredString } from '@/lib/validators';
import type { SiteSettings } from '@/types/models';

const siteSettingsSchema = new Schema<SiteSettings>(
  {
    key: { ...requiredString, unique: true, immutable: true },
    siteName: requiredString,
    logoUrl: { type: String, trim: true },
    address: { type: String, trim: true },
    heroTitle: requiredString,
    heroSubtitle: requiredString,
    heroImageUrl: requiredString,
    aboutTitle: requiredString,
    aboutDescription: requiredString,
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    instagramUrl: { type: String, trim: true },
    xUrl: { type: String, trim: true },
    facebookUrl: { type: String, trim: true },
  },
  { collection: 'site_settings', timestamps: true },
);

export const SiteSettingsModel =
  models.SiteSettings ||
  model<SiteSettings>('SiteSettings', siteSettingsSchema);
