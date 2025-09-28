import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma-client";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";
import { env } from "@/env";

declare module "next-auth" {
  interface Session {
    address?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      address?: string;
    };
  }

  interface User {
    address?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    address?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    // SIWE Provider
    CredentialsProvider({
      id: "siwe",
      name: "Sign-in with Ethereum",
      credentials: {
        message: {
          label: "Message",
          placeholder: "0x0",
          type: "text",
        },
        signature: {
          label: "Signature",
          placeholder: "0x0",
          type: "text",
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error("Missing SIWE credentials");
            return null;
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message));

          // Ensure address is properly checksummed
          const checksummedAddress = getAddress(siwe.address);

          const result = await siwe.verify({
            signature: credentials.signature,
          });

          if (!result.success) {
            console.error("SIWE verification failed:", result.error);
            return null;
          }

          // Check expiration
          if (
            siwe.expirationTime &&
            new Date(siwe.expirationTime) < new Date()
          ) {
            console.error("SIWE message expired");
            return null;
          }

          // Find or create user with checksummed address
          let user = await prisma.user.findUnique({
            where: { email: checksummedAddress.toLowerCase() },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: checksummedAddress.toLowerCase(),
                name: `${checksummedAddress.slice(0, 6)}...${checksummedAddress.slice(
                  -4
                )}`,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${checksummedAddress}`,
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            address: checksummedAddress,
          };
        } catch (error) {
          console.error("SIWE authorization error:", error);
          return null;
        }
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub Provider
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID!,
      clientSecret: env.GITHUB_CLIENT_SECRET!,
    }),

    // Email Provider
    EmailProvider({
      server: {
        host: env.EMAIL_HOST!,
        port: env.EMAIL_PORT!,
        auth: {
          user: env.EMAIL_USERNAME!,
          pass: env.EMAIL_PASSWORD!,
        },
      },
      from: env.EMAIL_FROM!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && user.address) {
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.address) {
        session.address = token.address;
        session.user.address = token.address;
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log(
        `User ${user.address || user.email} signed in via ${account?.provider}`
      );
    },
    async signOut({ session, token }) {
      console.log(`User ${session?.address || token?.address} signed out`);
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    verifyRequest: "/verify-request",
  },
  debug: env.NODE_ENV === "development",
  secret: env.NEXT_AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
