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

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LoginForm() {
  const [githubPending, startGitHubPending] = useTransition();
  const [googlePending, startGooglePending] = useTransition();
  const [siwePending, startSiwePending] = useTransition();
  const [email, setEmail] = useState("");
  const [emailPending, startEmailPending] = useTransition();
  const router = useRouter();

  async function signInWithGitHub() {
    startGitHubPending(async () => {
      try {
        const result = await signIn("github", {
          callbackUrl: "/",
          redirect: false,
        });

        if (result?.error) {
          toast.error(`GitHub sign-in error: ${result.error}`);
        } else if (result?.ok) {
          toast.success("Signed in with GitHub!");
          router.push("/");
        }
      } catch (error: any) {
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
        });

        if (result?.error) {
          toast.error(`Google sign-in error: ${result.error}`);
        } else if (result?.ok) {
          toast.success("Signed in with Google!");
          router.push("/");
        }
      } catch (error: any) {
        toast.error("Google sign-in failed");
      }
    });
  }

  async function signInWithEmail() {
    startEmailPending(async () => {
      try {
        const result = await signIn("email", {
          email,
          callbackUrl: "/",
          redirect: false,
        });

        if (result?.error) {
          toast.error(`Email sign-in error: ${result.error}`);
        } else if (result?.ok) {
          toast.success("Check your email for the sign-in link!");
          router.push("/verify-request?email=" + encodeURIComponent(email));
        }
      } catch (error: any) {
        toast.error("Email sign-in failed");
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
        const accounts = await window.ethereum.request({ 
          method: "eth_requestAccounts" 
        });

        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found");
        }

        // Properly format the address with EIP-55 checksum
        const rawAddress = accounts[0];
        const address = getAddress(rawAddress); // This ensures proper EIP-55 checksumming

        // Get chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });

        console.log("🔗 Connected:", { address, chainId: parseInt(chainId, 16) });

        // Get nonce from NextAuth
        const nonceRes = await fetch("/api/auth/nonce");
        if (!nonceRes.ok) {
          throw new Error("Failed to fetch nonce from server");
        }
        
        const { nonce } = await nonceRes.json();
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
          chainId: parseInt(chainId, 16),
          nonce,
          issuedAt: new Date().toISOString(),
          expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        });

        const messageText = message.prepareMessage();
        console.log("📝 SIWE Message prepared:", messageText);

        // Sign the message
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [messageText, address],
        });

        console.log("✍️ Message signed");

        // Sign in with NextAuth
        const result = await signIn("siwe", {
          message: JSON.stringify(message),
          signature,
          redirect: false,
        });

        if (result?.error) {
          console.error("❌ NextAuth SIWE error:", result.error);
          throw new Error(result.error);
        }

        if (result?.ok) {
          console.log("🎉 SIWE sign-in successful");
          toast.success(`Welcome ${address.slice(0, 6)}...${address.slice(-4)}!`);
          
          // Force session refresh and redirect
          await getSession();
          router.push("/");
        } else {
          throw new Error("Unknown sign-in error");
        }

      } catch (err: any) {
        console.error("🚨 Ethereum sign-in error:", err);
        
        // Provide user-friendly error messages
        let errorMessage = "Ethereum login failed";
        
        if (err.code === 4001) {
          errorMessage = "User rejected the signature request";
        } else if (err.message?.includes("No Ethereum wallet")) {
          errorMessage = "Please install MetaMask or another Web3 wallet";
        } else if (err.message?.includes("No accounts")) {
          errorMessage = "Please connect your wallet first";
        } else if (err.message?.includes("nonce")) {
          errorMessage = "Failed to get authentication nonce. Please try again.";
        } else if (err.message?.includes("verification")) {
          errorMessage = "Signature verification failed. Please try again.";
        } else if (err.message?.includes("EIP-55")) {
          errorMessage = "Invalid address format. Please try reconnecting your wallet.";
        } else if (err.message) {
          errorMessage = err.message;
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

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="h-12 bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 placeholder:text-slate-500 rounded-xl transition-all duration-200"
                required
              />
            </div>
            
            <Button
              onClick={signInWithEmail}
              disabled={emailPending || !email}
              className="w-full h-12 bg-gradient-to-r from-cyan-600/90 via-emerald-600/90 to-cyan-600/90 hover:from-cyan-500/90 hover:via-emerald-500/90 hover:to-cyan-500/90 border border-cyan-500/30 hover:border-cyan-400/50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  Sending Link...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-3" />
                  Send Sign-in Link
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
