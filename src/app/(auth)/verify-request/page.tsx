"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";

export default function VerifyRequestPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [emailPending, startVerification] = useTransition();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const isOtpComplete = otp.length === 6;

  function handleVerify() {
    startVerification(async () => {
      await authClient.signIn.emailOtp({
        email: email,
        otp: otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email verified successfully! Redirecting...");
            router.push("/");
          },
          onError: (error) => {
            toast.error(`Error verifying email/OTP: ${error.error.message}`);
          },
        },
      });
    });
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900/70 to-emerald-950/90 border border-cyan-300/20 dark:border-emerald-500/30 shadow-[0_8px_32px_rgba(18,185,214,0.15)] backdrop-blur-xl">
        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_60%)]" />
        
        <div className="relative z-10 p-8">
          <div className="text-center mb-8">
            <Image
              alt="EthEd Logo"
              src="/logos/logo.png"
              width={80}
              height={80}
              className="mx-auto rounded-2xl border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.2)] bg-white/10 backdrop-blur-sm"
            />
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-400/20">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Email Verification</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-cyan-400/90 via-emerald-300/90 to-blue-400/80 bg-clip-text text-transparent drop-shadow">
              Check Your Email
            </h1>
            
            <div className="space-y-2">
              <p className="text-slate-300/80 text-sm leading-relaxed">
                We sent a 6-digit verification code to
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-600/30">
                <Mail className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-200 font-medium text-sm">{email}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                className="gap-3"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot 
                    index={0} 
                    className="w-12 h-12 text-lg font-bold bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 rounded-xl transition-all duration-200"
                  />
                  <InputOTPSlot 
                    index={1} 
                    className="w-12 h-12 text-lg font-bold bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 rounded-xl transition-all duration-200"
                  />
                  <InputOTPSlot 
                    index={2} 
                    className="w-12 h-12 text-lg font-bold bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 rounded-xl transition-all duration-200"
                  />
                </InputOTPGroup>
                <InputOTPSeparator className="text-slate-500" />
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot 
                    index={3} 
                    className="w-12 h-12 text-lg font-bold bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 rounded-xl transition-all duration-200"
                  />
                  <InputOTPSlot 
                    index={4} 
                    className="w-12 h-12 text-lg font-bold bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 rounded-xl transition-all duration-200"
                  />
                  <InputOTPSlot 
                    index={5} 
                    className="w-12 h-12 text-lg font-bold bg-slate-800/50 border border-slate-600/30 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 text-slate-200 rounded-xl transition-all duration-200"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              disabled={emailPending || !isOtpComplete}
              className="w-full h-12 bg-gradient-to-r from-cyan-600/90 via-emerald-600/90 to-cyan-600/90 hover:from-cyan-500/90 hover:via-emerald-500/90 hover:to-cyan-500/90 border border-cyan-500/30 hover:border-cyan-400/50 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  Verifying Code...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 mr-3" />
                  Verify Email
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-400 leading-relaxed">
              Didn't receive the code?{" "}
              <a 
                href="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
              >
                Try again
              </a>{" "}
              or check your spam folder.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}