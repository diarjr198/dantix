import { isValidObjectId } from 'mongoose';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/server/auth/authorization';
import { z } from 'zod';
import { connectDatabase } from '@/server/db/connection';
import { FaqModel } from '@/server/models/faq';
import { SiteSettingsModel } from '@/server/models/site-settings';

const SETTINGS_KEY = 'default';

export const defaultSiteSettings = {
  siteName: 'TipTip',
  logoUrl: '',
  address: 'Go Work Central Park, Central Park Mall, Level LG, Unit L109–L114, Jl. Letjen S. Parman, Jakarta 11470',
  heroTitle: 'Temukan Event Seru, Beli Tiketnya di Sini',
  heroSubtitle: 'Jelajahi konser, festival, dan berbagai event pilihan di Indonesia.',
  heroImageUrl: '/images/hero.png',
  aboutTitle: 'Semua yang perlu kamu tahu',
  aboutDescription: 'TipTip membantu kamu menemukan event dan membeli tiket dengan mudah.',
  contactEmail: '',
  contactPhone: '',
  instagramUrl: '',
  xUrl: '',
  facebookUrl: '',
} as const;

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value !== 'string' || !value.trim()) return '';
    const url = value.trim();
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  },
  z.union([z.literal(''), z.url()]),
);

export const siteSettingsInputSchema = z
  .object({
    siteName: z.string().trim().min(1).max(100),
    logoUrl: optionalUrl.default(''),
    address: z.string().trim().max(500).default(''),
    heroTitle: z.string().trim().min(1).max(200),
    heroSubtitle: z.string().trim().min(1).max(500),
    heroImageUrl: z.string().trim().min(1).max(2_000),
    aboutTitle: z.string().trim().min(1).max(200),
    aboutDescription: z.string().trim().min(1).max(2_000),
    contactEmail: z.union([z.literal(''), z.email()]).default(''),
    contactPhone: z.string().trim().max(30).default(''),
    instagramUrl: optionalUrl.default(''),
    xUrl: optionalUrl.default(''),
    facebookUrl: optionalUrl.default(''),
  })
  .strip();

export const faqCreateSchema = z
  .object({
    question: z.string().trim().min(1).max(300),
    answer: z.string().trim().min(1).max(5_000),
    sortOrder: z.number().int().min(0).max(100_000).default(0),
    published: z.boolean().default(true),
  })
  .strip();

export const faqUpdateSchema = faqCreateSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  'Tidak ada perubahan',
);

function serializeSettings(settings: Record<string, unknown>) {
  const content = { ...settings };
  const id = content._id?.toString();
  delete content._id;
  delete content.key;
  delete content.__v;
  return { ...content, id };
}

function serializeFaq(faq: Record<string, unknown>) {
  const content = { ...faq };
  const id = content._id?.toString();
  delete content._id;
  delete content.__v;
  return { ...content, id };
}

export async function getPublicSiteSettings() {
  await connectDatabase();
  const settings = await SiteSettingsModel.findOne({ key: SETTINGS_KEY }).lean();
  if (!settings) return { ...defaultSiteSettings };
  return {
    ...defaultSiteSettings,
    ...serializeSettings(settings as unknown as Record<string, unknown>),
  };
}

export async function getAdminSiteSettings() {
  await requireAdmin();
  return getPublicSiteSettings();
}

export async function updateSiteSettings(input: unknown) {
  await requireAdmin();
  const data = siteSettingsInputSchema.parse(input);
  await connectDatabase();
  const settings = await SiteSettingsModel.findOneAndUpdate(
    { key: SETTINGS_KEY },
    { $set: data, $setOnInsert: { key: SETTINGS_KEY } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  if (!settings) throw new Error('NOT_FOUND');
  revalidatePath('/', 'layout');
  revalidatePath('/dashboard/website');
  return serializeSettings(settings as unknown as Record<string, unknown>);
}

export async function listPublicFaqs() {
  await connectDatabase();
  const faqs = await FaqModel.find({ published: true })
    .sort({ sortOrder: 1, _id: 1 })
    .lean();
  return faqs.map((faq) => serializeFaq(faq as unknown as Record<string, unknown>));
}

export async function listAdminFaqs() {
  await requireAdmin();
  await connectDatabase();
  const faqs = await FaqModel.find().sort({ sortOrder: 1, _id: 1 }).lean();
  return faqs.map((faq) => serializeFaq(faq as unknown as Record<string, unknown>));
}

export async function createFaq(input: unknown) {
  await requireAdmin();
  const data = faqCreateSchema.parse(input);
  await connectDatabase();
  const faq = await FaqModel.create(data);
  revalidatePath('/');
  revalidatePath('/dashboard/faqs');
  return serializeFaq(faq.toObject() as Record<string, unknown>);
}

export async function updateFaq(id: string, input: unknown) {
  await requireAdmin();
  if (!isValidObjectId(id)) throw new Error('INVALID_ID');
  const data = faqUpdateSchema.parse(input);
  await connectDatabase();
  const faq = await FaqModel.findByIdAndUpdate(id, { $set: data }, {
    new: true,
    runValidators: true,
  }).lean();
  if (!faq) throw new Error('NOT_FOUND');
  revalidatePath('/');
  revalidatePath('/dashboard/faqs');
  return serializeFaq(faq as unknown as Record<string, unknown>);
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) throw new Error('INVALID_ID');
  await connectDatabase();
  const faq = await FaqModel.findByIdAndDelete(id).lean();
  if (!faq) throw new Error('NOT_FOUND');
  revalidatePath('/');
  revalidatePath('/dashboard/faqs');
  return serializeFaq(faq as unknown as Record<string, unknown>);
}
