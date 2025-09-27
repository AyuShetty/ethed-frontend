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
import { authClient } from "@/lib/auth-client";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginForm() {
  const [githubPending, startGitHubPending] = useTransition();
  const [googlePending, startGooglePending] = useTransition();
  const [emailPending, startEmailPending] = useTransition();
  const [email, setEmail] = useState("");
  const router = useRouter();

  async function signInWithGitHub() {
    startGitHubPending(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with GitHub!");
          },
          onError: (error) => {
            toast.error(`GitHub sign-in error: ${error.error.message}`);
          },
        },
      });
    });
  }

  async function signInWithGoogle() {
    startGooglePending(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        fetchOptions: {
          onError: (error) => {
            toast.error(`Google sign-in error: ${error.error.message}`);
          },
        },
      });
    });
  }

  async function signInWithEmail() {
    startEmailPending(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification email sent!");
            router.push(`/verify-request?email=${email}`);
          },
          onError: (error) => {
            toast.error(`Email OTP error: ${error.error.message}`);
          },
        },
      });
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
                  Sending Code...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-3" />
                  Send Verification Code
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
