"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, WalletIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { SiweMessage } from "siwe";
import { getAddress } from "viem";

// Proper Ethereum provider types
interface EthereumProvider {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  on?: (eventName: string, handler: (data: unknown) => void) => void;
  removeListener?: (eventName: string, handler: (data: unknown) => void) => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Error types for better error handling
interface EthereumError extends Error {
  code?: number;
  data?: unknown;
}

interface SignInResult {
  error?: string;
  ok?: boolean;
  status?: number;
  url?: string | null;
}

export default function LoginForm() {
  const [githubPending, startGitHubPending] = useTransition();
  const [googlePending, startGooglePending] = useTransition();
  const [siwePending, startSiwePending] = useTransition();
  const router = useRouter();

  async function signInWithGitHub() {
    startGitHubPending(async () => {
      try {
        const result = await signIn("github", {
          callbackUrl: "/",
          redirect: false,
        }) as SignInResult | undefined;

        if (result?.error) {
          toast.error(`GitHub sign-in error: ${result.error}`);
        } else if (result?.ok) {
          toast.success("Signed in with GitHub!");
          router.push("/");
        }
      } catch (error) {
        console.error("GitHub sign-in error:", error);
        toast.error("GitHub sign-in failed");
      }
    });
  }

  async function signInWithGoogle() {
    startGooglePending(async () => {
      try {
        const result = await signIn("google", {
          callbackUrl: "/",
          redirect: false,
        }) as SignInResult | undefined;

        if (result?.error) {
          toast.error(`Google sign-in error: ${result.error}`);
        } else if (result?.ok) {
          toast.success("Signed in with Google!");
          router.push("/");
        }
      } catch (error) {
        console.error("Google sign-in error:", error);
        toast.error("Google sign-in failed");
      }
    });
  }

  async function signInWithEthereum() {
    startSiwePending(async () => {
      try {
        // Check for Ethereum provider
        if (!window.ethereum) {
          throw new Error("No Ethereum wallet found. Please install MetaMask or another Web3 wallet.");
        }

        // Request wallet access
        const accountsResult = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });

        // Type guard for accounts array
        if (!Array.isArray(accountsResult) || accountsResult.length === 0) {
          throw new Error("No accounts found");
        }

        const accounts = accountsResult as string[];

        // Properly format the address with EIP-55 checksum
        const rawAddress = accounts[0];
        const address = getAddress(rawAddress); // This ensures proper EIP-55 checksumming

        // Get chain ID
        const chainIdResult = await window.ethereum.request({
          method: "eth_chainId",
        });

        const chainId = typeof chainIdResult === 'string' 
          ? parseInt(chainIdResult, 16) 
          : Number(chainIdResult);

        console.log("🔗 Connected:", { address, chainId });

        // Get nonce from NextAuth
        const nonceRes = await fetch("/api/auth/nonce");
        if (!nonceRes.ok) {
          throw new Error("Failed to fetch nonce from server");
        }
        
        const nonceData = await nonceRes.json() as { nonce?: string };
        const { nonce } = nonceData;
        
        if (!nonce) {
          throw new Error("Failed to get nonce from server");
        }

        console.log("🎲 Received nonce:", nonce);

        // Create SIWE message with properly formatted address
        const message = new SiweMessage({
          domain: window.location.host,
          address: address, // Use the checksummed address
          statement: "Sign in to EthEd with your Ethereum account.",
          uri: window.location.origin,
          version: "1",
          chainId: chainId,
          nonce,
          issuedAt: new Date().toISOString(),
          expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        });

        const messageText = message.prepareMessage();
        console.log("📝 SIWE Message prepared:", messageText);

        // Sign the message
        const signatureResult = await window.ethereum.request({
          method: "personal_sign",
          params: [messageText, address],
        });

        const signature = signatureResult as string;
        console.log("✍️ Message signed");

        // Sign in with NextAuth
        const result = await signIn("siwe", {
          message: JSON.stringify(message),
          signature,
          redirect: false,
        }) as SignInResult | undefined;

        if (result?.error) {
          console.error("❌ NextAuth SIWE error:", result.error);
          throw new Error(result.error);
        }

        if (result?.ok) {
          console.log("🎉 SIWE sign-in successful");
          toast.success(`Welcome ${address.slice(0, 6)}...${address.slice(-4)}!`);
          
          // Force session refresh and redirect
          await getSession();
          router.push("/onboarding");
        } else {
          throw new Error("Unknown sign-in error");
        }

      } catch (err) {
        console.error("🚨 Ethereum sign-in error:", err);
        
        // Type guard for Ethereum errors
        const error = err as EthereumError;
        
        // Provide user-friendly error messages
        let errorMessage = "Ethereum login failed";
        
        if (error.code === 4001) {
          errorMessage = "User rejected the signature request";
        } else if (error.message?.includes("No Ethereum wallet")) {
          errorMessage = "Please install MetaMask or another Web3 wallet";
        } else if (error.message?.includes("No accounts")) {
          errorMessage = "Please connect your wallet first";
        } else if (error.message?.includes("nonce")) {
          errorMessage = "Failed to get authentication nonce. Please try again.";
        } else if (error.message?.includes("verification")) {
          errorMessage = "Signature verification failed. Please try again.";
        } else if (error.message?.includes("EIP-55")) {
          errorMessage = "Invalid address format. Please try reconnecting your wallet.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      }
    });
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900/70 to-emerald-950/90 border border-cyan-300/20 dark:border-emerald-500/30 shadow-[0_8px_32px_rgba(18,185,214,0.15)] backdrop-blur-xl">
        {/* Glassmorphic overlay */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_60%)]" />
        
        <div className="relative z-10 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              alt="EthEd Logo"
              src="/logos/logo.png"
              width={80}
              height={80}
              className="mx-auto rounded-2xl border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.2)] bg-white/10 backdrop-blur-sm"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-cyan-400/90 via-emerald-300/90 to-blue-400/80 bg-clip-text text-transparent drop-shadow">
              Welcome Back
            </h1>
            <p className="text-slate-300/80 text-sm font-medium leading-relaxed">
              Sign in to continue your EthEd journey
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              disabled={githubPending}
              onClick={signInWithGitHub}
              className="w-full h-12 bg-gradient-to-r from-slate-800/90 via-slate-900/90 to-slate-800/90 hover:from-slate-700/90 hover:via-slate-800/90 hover:to-slate-700/90 border border-slate-600/30 hover:border-slate-500/50 text-white/90 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {githubPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
              ) : (
                <FaGithub className="h-5 w-5 text-slate-300" />
              )}
              <span className="ml-3">Continue with GitHub</span>
            </Button>

            <Button
              disabled={googlePending}
              onClick={signInWithGoogle}
              className="w-full h-12 bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-blue-600/90 hover:from-blue-500/90 hover:via-blue-600/90 hover:to-blue-500/90 border border-blue-500/30 hover:border-blue-400/50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {googlePending ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-200" />
              ) : (
                <FaGoogle className="h-5 w-5 text-blue-200" />
              )}
              <span className="ml-3">Continue with Google</span>
            </Button>

            <Button
              disabled={siwePending}
              onClick={signInWithEthereum}
              className="w-full h-12 bg-gradient-to-r from-purple-600/90 via-purple-500/90 to-purple-600/90 hover:from-purple-500/90 hover:via-purple-400/90 hover:to-purple-500/90 border border-purple-500/30 hover:border-purple-400/50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {siwePending ? (
                <Loader2 className="h-5 w-5 animate-spin text-purple-100" />
              ) : (
                <WalletIcon className="h-5 w-5 text-purple-100" />
              )}
              <span className="ml-3">Sign in with Ethereum</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600/30" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gradient-to-r from-blue-950/90 via-slate-900/90 to-emerald-950/90 px-4 text-slate-400 font-medium uppercase tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
