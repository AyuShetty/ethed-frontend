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
      className="
        w-full text-center rounded-3xl overflow-hidden
        border border-cyan-300/20 dark:border-emerald-500/30
        bg-gradient-to-br from-blue-950/70 via-slate-900/60 to-emerald-950/80
        shadow-[0_2px_28px_2px_rgba(18,185,214,0.08)]
        backdrop-blur-2xl px-7 py-8 relative
      "
    >
      {/* Logo - subtle size */}
      <Image
        alt="EthEd Logo"
        src="/logos/logo.png"
        width={72}
        height={72}
        className="mx-auto mb-4 rounded-2xl border border-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.15)] bg-white/20"
      />

      {/* Title */}
      <CardHeader className="px-0 space-y-1 pb-4">
        <CardTitle
          className="
            text-2xl font-extrabold tracking-tight
            bg-gradient-to-r from-cyan-400/70 via-emerald-300/80 to-blue-400/70
            bg-clip-text text-transparent drop-shadow
          "
        >
          Welcome Back
        </CardTitle>
        <CardDescription className="text-sm text-cyan-200/70 font-medium">
          Sign in to continue your EthEd journey.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 px-0">
        {/* GitHub */}
        <Button
          disabled={githubPending}
          onClick={signInWithGitHub}
          className="
            w-full flex gap-2 items-center justify-center rounded-xl py-3 text-sm
            bg-gradient-to-r from-slate-900/80 via-slate-950/90 to-emerald-950/85
            text-white/90 font-semibold border border-cyan-600/20
            shadow hover:shadow-lg hover:border-cyan-500/40 transition-all
            hover:bg-gradient-to-r hover:from-slate-800/90 hover:via-blue-950/85 hover:to-emerald-950/80
          "
        >
          {githubPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300/80" />
          ) : (
            <FaGithub className="h-5 w-5 text-slate-200/80" />
          )}
          Continue with GitHub
        </Button>

        {/* Google */}
        <Button
          disabled={googlePending}
          onClick={signInWithGoogle}
          className="
            w-full flex gap-2 items-center justify-center rounded-xl py-3 text-sm
            bg-gradient-to-r from-emerald-700/80 via-cyan-700/70 to-blue-700/80
            text-white/90 font-semibold border border-emerald-500/30
            shadow hover:shadow-lg hover:border-emerald-400/40 transition-all
            hover:bg-gradient-to-r hover:from-emerald-600/90 hover:via-cyan-600/80 hover:to-blue-600/90
          "
        >
          {googlePending ? (
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300/80" />
          ) : (
            <FaGoogle className="h-5 w-5 text-slate-200/80" />
          )}
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative my-4 select-none">
          <div className="absolute inset-0 top-1/2 border-t border-cyan-700/20" />
          <span className="relative px-4 bg-blue-950/85 text-xs font-semibold uppercase tracking-wider text-cyan-300/60">
            Or sign in with email
          </span>
        </div>

        {/* Email */}
        <div className="grid gap-3 text-left">
          <div className="grid gap-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-cyan-200/80"
            >
              Email Address
            </Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="
                rounded-xl bg-slate-900/80 border border-cyan-600/30
                text-cyan-100 placeholder:text-cyan-400/30
                focus-visible:ring-2 focus-visible:ring-emerald-400/30
                shadow hover:shadow-md transition
              "
              required
            />
          </div>
          <Button
            onClick={signInWithEmail}
            disabled={emailPending}
            className="
              w-full flex gap-2 items-center justify-center rounded-xl py-3 text-sm
              bg-gradient-to-r from-cyan-700/80 via-emerald-600/80 to-blue-700/80
              text-white font-semibold border border-cyan-500/30
              shadow hover:shadow-lg transition-all
              hover:bg-gradient-to-r hover:from-cyan-500/90 hover:via-emerald-500/90 hover:to-blue-500/90
            "
          >
            {emailPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-300/80" />
            ) : (
              <Send className="size-4 text-slate-200/80" />
            )}
            Continue with Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
