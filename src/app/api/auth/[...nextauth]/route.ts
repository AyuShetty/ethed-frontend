// /lib/auth.ts
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
    CredentialsProvider({
      id: "siwe",
      name: "Sign-in with Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature) return null;

        const siwe = new SiweMessage(JSON.parse(credentials.message));
        const checksummedAddress = getAddress(siwe.address);

        const result = await siwe.verify({ signature: credentials.signature });
        if (!result.success || (siwe.expirationTime && new Date(siwe.expirationTime) < new Date())) return null;

        let user = await prisma.user.findUnique({
          where: { email: checksummedAddress.toLowerCase() },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: checksummedAddress.toLowerCase(),
              name: `${checksummedAddress.slice(0, 6)}...${checksummedAddress.slice(-4)}`,
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${checksummedAddress}`,
            },
          });
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image, address: checksummedAddress };
      },
    }),
    GoogleProvider({ clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! }),
    GitHubProvider({ clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! }),
    EmailProvider({
      server: { host: env.EMAIL_HOST!, port: env.EMAIL_PORT!, auth: { user: env.EMAIL_USERNAME!, pass: env.EMAIL_PASSWORD! } },
      from: env.EMAIL_FROM!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.address) token.address = user.address;
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
  pages: { signIn: "/login", error: "/auth/error", verifyRequest: "/verify-request" },
  debug: env.NODE_ENV === "development",
  secret: env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
