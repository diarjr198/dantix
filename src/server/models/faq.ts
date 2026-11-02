import { model, models, Schema } from 'mongoose';
import { requiredString } from '@/lib/validators';
import type { Faq } from '@/types/models';

const faqSchema = new Schema<Faq>(
  {
    question: requiredString,
    answer: requiredString,
    sortOrder: { type: Number, required: true, default: 0 },
    published: { type: Boolean, required: true, default: true },
  },
  { collection: 'faqs', timestamps: true },
);

faqSchema.index({ sortOrder: 1, _id: 1 });

export const FaqModel = models.Faq || model<Faq>('Faq', faqSchema);
