import { z } from 'zod';

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().trim().min(1, 'MONGODB_DB_NAME is required'),
  APP_URL: z.url('APP_URL must be a valid URL'),
  AUTH_SESSION_SECRET: z
    .string()
    .min(32, 'AUTH_SESSION_SECRET must be at least 32 characters'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join('; ');
    throw new Error(`Invalid server environment: ${message}`);
  }

  return result.data;
}
