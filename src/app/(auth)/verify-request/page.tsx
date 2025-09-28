"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function VerifyRequestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }

    setIsResending(true);
    try {
      const result = await signIn("email", {
        email,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to resend email");
      } else {
        toast.success("Verification email sent again!");
      }
    } catch (error) {
      toast.error("Failed to resend email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
      {/* EthEd radial/glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-300/15 via-background to-background" />
        <div className="absolute top-10 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md mx-auto">
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="p-8">
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
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">
                  Email Verification
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Check Your Email
              </h1>

              <div className="space-y-3">
                <p className="text-slate-300 text-sm leading-relaxed">
                  We've sent a verification link to your email address.
                </p>
                {email && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/30 border border-white/10">
                    <Mail className="h-4 w-4 text-cyan-400" />
                    <span className="text-cyan-200 font-medium text-sm">
                      {email}
                    </span>
                  </div>
                )}
                <p className="text-slate-400 text-xs">
                  Click the link in your email to complete sign-in.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8 space-y-4">
              <div className="rounded-lg bg-slate-700/30 border border-white/10 p-4">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  Next Steps
                </h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Check your inbox for the verification email</li>
                  <li>• Click the "Sign in to EthEd" button in the email</li>
                  <li>• You'll be automatically signed in</li>
                </ul>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-400/20 p-4">
                <h3 className="text-yellow-300 font-medium mb-2 text-sm">
                  Can't find the email?
                </h3>
                <p className="text-yellow-200/80 text-xs">
                  Check your spam folder or try resending the verification link.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {email && (
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => router.push("/login")}
                variant="outline"
                className="w-full border-slate-400/30 text-slate-300 hover:bg-slate-500/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Having trouble? Contact{" "}
                <a
                  href="mailto:support@ethed.dev"
                  className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
                >
                  support@ethed.dev
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}