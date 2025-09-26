"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

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
    <Card className="bg-gradient-to-br from-blue-50/90 via-cyan-100/85 to-emerald-50/90 dark:from-[#0c242b] dark:to-[#0f3439] border border-cyan-200 shadow-xl backdrop-blur-md w-full max-w-sm mx-auto rounded-2xl">
      <CardHeader className="text-center px-0 pt-4">
        <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-cyan-700 to-blue-700 bg-clip-text text-transparent uppercase tracking-tight">
          Email Verification
        </CardTitle>
        <CardDescription className="text-base text-cyan-900/80 dark:text-cyan-100/80 mt-2">
          We just sent a 6-digit code to <span className="font-bold text-blue-800 dark:text-cyan-200">{email}</span>.
          <br />
          Paste your code below to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-4">
        <div className="flex flex-col items-center space-y-2 mb-2">
          <InputOTP
            maxLength={6}
            className="gap-2 justify-center px-1"
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="rounded-lg border border-cyan-300 bg-blue-50 text-blue-900 dark:bg-[#102727] dark:border-emerald-700 dark:text-cyan-100"/>
              <InputOTPSlot index={1} className="rounded-lg border border-cyan-300 bg-blue-50 text-blue-900 dark:bg-[#102727] dark:border-emerald-700 dark:text-cyan-100"/>
              <InputOTPSlot index={2} className="rounded-lg border border-cyan-300 bg-blue-50 text-blue-900 dark:bg-[#102727] dark:border-emerald-700 dark:text-cyan-100"/>
              <InputOTPSeparator />
              <InputOTPSlot index={3} className="rounded-lg border border-cyan-300 bg-blue-50 text-blue-900 dark:bg-[#102727] dark:border-emerald-700 dark:text-cyan-100"/>
              <InputOTPSlot index={4} className="rounded-lg border border-cyan-300 bg-blue-50 text-blue-900 dark:bg-[#102727] dark:border-emerald-700 dark:text-cyan-100"/>
              <InputOTPSlot index={5} className="rounded-lg border border-cyan-300 bg-blue-50 text-blue-900 dark:bg-[#102727] dark:border-emerald-700 dark:text-cyan-100"/>
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="text-sm text-center text-cyan-800 dark:text-cyan-400 mt-2">
          If you didn’t receive the email, check your spam folder or{" "}
          <a href="/login" className="font-semibold text-emerald-600 hover:underline transition-colors">
            try logging in again
          </a>
          .
        </div>
        <Button
          onClick={handleVerify}
          disabled={emailPending || !isOtpComplete}
          className="w-full mt-4 bg-gradient-to-r from-cyan-600 via-blue-500 to-emerald-400 text-white font-bold shadow-md hover:brightness-110 rounded-lg"
        >
          {emailPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2">Verifying...</span>
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
