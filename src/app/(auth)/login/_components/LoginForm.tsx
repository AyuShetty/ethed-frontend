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
    <Card
      className="w-full max-w-md mx-auto text-center rounded-3xl overflow-hidden
        border border-cyan-400/30 dark:border-emerald-500/40 
        bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/95
        shadow-[0_0_25px_rgba(34,211,238,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)]
        backdrop-blur-2xl p-8 relative"
    >
      {/* Logo */}
      {/* <Image
        alt="EthEd Logo"
        src="/logos/logo.png"
        width={110}
        height={110}
        className="mx-auto mb-5 rounded-full border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.35)]"
      /> */}

      {/* Title */}
      <CardHeader className="px-0 space-y-2">
        <CardTitle
          className="text-3xl font-extrabold tracking-tight
          bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 
          bg-clip-text text-transparent drop-shadow-lg"
        >
          Welcome Back
        </CardTitle>
        <CardDescription className="text-base text-cyan-200/80 font-medium">
          Sign in to continue your EthEd journey.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0 mt-4">
        {/* GitHub */}
        <Button
          disabled={githubPending}
          onClick={signInWithGitHub}
          className="w-full flex gap-2 items-center justify-center rounded-xl
            bg-gradient-to-r from-slate-800 via-slate-900 to-black 
            text-white font-semibold border border-cyan-600/40
            hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]
            transition-all"
        >
          {githubPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FaGithub className="h-5 w-5" />
          )}
          Continue with GitHub
        </Button>

        {/* Google */}
        <Button
          disabled={googlePending}
          onClick={signInWithGoogle}
          className="w-full flex gap-2 items-center justify-center rounded-xl
            bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500
            text-white font-semibold border border-emerald-500/40
            hover:shadow-[0_0_18px_rgba(16,185,129,0.45)]
            transition-all"
        >
          {googlePending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FaGoogle className="h-5 w-5" />
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 top-1/2 border-t border-cyan-700/40" />
          <span className="relative px-3 bg-slate-950/95 text-xs font-semibold uppercase tracking-wider text-cyan-300/70">
            Or sign in with email
          </span>
        </div>

        {/* Email */}
        <div className="grid gap-4 text-left">
          <div className="grid gap-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-cyan-200"
            >
              Email Address
            </Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="rounded-xl bg-slate-900/80 border border-cyan-600/40
                text-cyan-100 placeholder:text-cyan-400/40
                focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              required
            />
          </div>
          <Button
            onClick={signInWithEmail}
            disabled={emailPending}
            className="w-full flex gap-2 items-center justify-center rounded-xl
              bg-gradient-to-r from-cyan-600 via-emerald-500 to-blue-500
              text-white font-semibold border border-cyan-500/40
              hover:shadow-[0_0_18px_rgba(34,211,238,0.45)]
              transition-all"
          >
            {emailPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Continue with Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
