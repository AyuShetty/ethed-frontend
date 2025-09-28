import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import { env } from "@/env";
import { emailOTP, siwe, admin } from "better-auth/plugins";
import { sendMail } from "@/lib/mailer";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "viem";

const prisma = new PrismaClient();

// Production-ready configuration
const getAuthConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    domain: isProduction ? "ethed.com" : "localhost:3000",
    baseURL: isProduction ? "https://ethed.com" : "http://localhost:3000",
    trustedOrigins: isProduction
      ? ["https://ethed.com", "https://www.ethed.com"]
      : ["http://localhost:3000", "http://localhost:3001"],
  };
};

const authConfig = getAuthConfig();

// Generate SIWE-compliant nonce (alphanumeric only)
const generateSiweNonce = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: authConfig.baseURL,
  trustedOrigins: authConfig.trustedOrigins,
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendMail({
          to: email,
          subject: "EthEd - Verify your email",
          text: `Your verification code is: ${otp}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Verify your email for EthEd</h2>
              <p>Your verification code is:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${otp}</span>
              </div>
              <p style="color: #6b7280;">This code will expire in 10 minutes.</p>
              <p style="color: #6b7280;">If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        });
      },
    }),
    siwe({
      domain: authConfig.domain,
      anonymous: false,
      getNonce: async () => {
        // Generate a SIWE-compliant nonce (alphanumeric only)
        const nonce = generateSiweNonce();
        console.log("🎲 Generated SIWE nonce:", nonce.substring(0, 8) + "...");
        return nonce;
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          console.log("🔐 Verifying SIWE message:", {
            messageLength: message.length,
            signatureLength: signature.length,
            address: address.slice(0, 6) + "..." + address.slice(-4),
          });

          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });

          console.log("🔐 SIWE verification result:", isValid);
          return isValid;
        } catch (error) {
          console.error("❌ SIWE verification error:", error);
          return false;
        }
      },
    }),
    admin(),
  ],
});
