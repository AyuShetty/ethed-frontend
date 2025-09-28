import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    MONGODB_URI: z.string(),
    OPENPRS_MONGODB_URI: z.string(),
    OPENPRS_DATABASE: z.string().min(1),

    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url(),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    DOMAIN: z.string().min(1),

    GITHUB_ACCESS_TOKEN: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GITHUB_CLIENT_ID: z.string().min(1),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    RESEND_API_KEY: z.string(),

    EMAIL_HOST: z.string().min(1),
    EMAIL_PORT: z.coerce.number(),
    EMAIL_USERNAME: z.string().min(1),
    EMAIL_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string(),

    WALLETCONNECT_PROJECT_ID: z.string(),

    ARCJET_KEY: z.string().min(1),

    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    CRON_SECRET: z.string().min(1),

    PINATA_API_KEY: z.string().optional(),
    PINATA_API_SECRET: z.string().optional(),
    PINATA_JWT: z.string().optional(),
    PINATA_GATEWAY_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_AMOY_RPC: z.string().url(),
    NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_TREASURY_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_X402_ADDRESS: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_AMOY_RPC: process.env.NEXT_PUBLIC_AMOY_RPC,
    NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_PAYMENT_MANAGER_ADDRESS,
    NEXT_PUBLIC_TREASURY_ADDRESS: process.env.NEXT_PUBLIC_TREASURY_ADDRESS,
    NEXT_PUBLIC_X402_ADDRESS: process.env.NEXT_PUBLIC_X402_ADDRESS,
  },
});
