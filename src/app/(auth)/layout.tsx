"use client";

import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen px-4 py-12 bg-[radial-gradient(ellipse_120%_70%_at_50%_-20%,#0f4b4b20_0%,#031616_70%,#000000_100%)] text-cyan-100 overflow-hidden">
      
      {/* Subtle electric grid background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#00fff533_1px,transparent_1px),linear-gradient(to_bottom,#00f2ff1a_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

      {/* Glowing background aura */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 md:h-[28rem] md:w-[28rem] rounded-full bg-emerald-400/10 blur-3xl" />

      {/* Floating accent glows */}
      <div className="absolute -top-20 left-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
      <div className="absolute -bottom-20 right-1/4 w-56 h-56 bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>

      {/* Back Button */}
      <Link
        href="/"
        className={buttonVariants({
          variant: "ghost",
          className:
            "absolute left-6 top-6 z-20 flex items-center gap-2 bg-black/50 border border-cyan-600/40 text-cyan-200 hover:text-emerald-300 shadow-lg shadow-emerald-400/10 backdrop-blur-md px-5 py-2 rounded-full font-semibold transition-all hover:scale-105",
        })}
      >
        <ArrowLeft className="size-4" />
        Home
      </Link>

      {/* Centered Content Container */}
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Auth Content */}
          <div className="relative z-10 w-full max-w-md">
            {children}
          </div>

          {/* Disclaimer */}
          <p className="mt-7 max-w-xs text-xs text-cyan-200/70 text-center leading-relaxed">
            By clicking{" "}
            <span className="font-semibold text-emerald-400">
              &quot;Continue with GitHub/Google&quot;
            </span>
            , you agree to our{" "}
            <Link
              href="/terms"
              className="text-cyan-300 hover:text-emerald-300 hover:underline font-medium transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-cyan-300 hover:text-emerald-300 hover:underline font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
