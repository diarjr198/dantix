import { z } from 'zod';

const phonePattern = /^(?:\+62|62|0)8\d{7,12}$/;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[\s-]/g, '');
  const localNumber = digits.startsWith('+62')
    ? digits.slice(3)
    : digits.startsWith('62')
      ? digits.slice(2)
      : digits.slice(1);

  return `+62${localNumber}`;
}

const phoneSchema = z
  .string()
  .trim()
  .refine((phone) => phonePattern.test(phone.replace(/[\s-]/g, '')), {
    message: 'Nomor HP Indonesia tidak valid',
  })
  .transform(normalizePhone);

const passwordSchema = z.string().min(8, 'Password minimal 8 karakter');

const registrationBaseSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(100),
  password: passwordSchema,
  confirmPassword: z.string(),
});

export const registerRequestSchema = z
  .discriminatedUnion('method', [
    registrationBaseSchema.extend({
      method: z.literal('email'),
      email: z
        .email('Email tidak valid')
        .transform((email) => email.toLowerCase()),
    }),
    registrationBaseSchema.extend({
      method: z.literal('phone'),
      phone: phoneSchema,
    }),
  ])
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword'],
  });

export const loginRequestSchema = z
  .object({
    method: z.enum(['phone', 'email']),
    identifier: z.string().trim().min(1, 'Email atau nomor HP wajib diisi'),
    password: z.string().min(1, 'Password wajib diisi'),
  })
  .transform(({ method, identifier, password }) => ({
    method,
    identifier:
      method === 'phone'
        ? phoneSchema.parse(identifier)
        : z.email('Email tidak valid').parse(identifier).toLowerCase(),
    password,
  }));

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
