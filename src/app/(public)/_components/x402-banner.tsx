"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Wallet, Globe, MessageCircle, Gift, ArrowRight } from "lucide-react";

export default function X402Banner() {
  return (
    <section className="relative py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-screen-xl px-4 md:px-8"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-blue-500/10 p-6 md:p-8">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-300/30 bg-black/40 px-3 py-1 text-xs text-cyan-200 backdrop-blur-sm">
                Polygon Amoy • x402 Agentic Payments
              </div>
              <h3 className="mt-3 bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-2xl font-bold text-transparent md:text-3xl">
                Pay-as-you-learn. Agentic micropayments and subscriptions.
              </h3>
              <p className="mt-2 text-slate-300">
                Use Polygon x402-style routing for seamless micropayments, subscriptions, and refunds.
                Earn NFTs as you progress.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-emerald-200 text-sm">
                  <Wallet className="h-4 w-4" /> Gasless feel (simulated)
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-cyan-200 text-sm">
                  <Globe className="h-4 w-4" /> ENS subdomain ready
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-blue-300/20 bg-blue-400/10 px-3 py-2 text-blue-200 text-sm">
                  <Gift className="h-4 w-4" /> NFT rewards
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700">
                  <Link href="/pricing">
                    Explore Pricing & x402 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-cyan-400/50 text-cyan-200">
                  <Link href="/onboarding">
                    Try the Buddy Chat <MessageCircle className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="mx-auto w-full max-w-md rounded-xl border border-cyan-300/20 bg-black/40 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="text-2xl">🐉</div>
                  <div>
                    <div className="text-cyan-300 font-medium">Spark</div>
                    <div className="text-xs text-slate-400">Your AI Learning Buddy</div>
                  </div>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="w-fit max-w-[90%] rounded-lg bg-slate-800 px-3 py-2 text-slate-200">
                    Welcome! Ready to mint your ENS name and start learning?
                  </div>
                  <div className="ml-auto w-fit max-w-[90%] rounded-lg bg-emerald-600 px-3 py-2 text-white">
                    Yes! Let's go. Also want to try x402 micropayments.
                  </div>
                  <div className="w-fit max-w-[90%] rounded-lg bg-slate-800 px-3 py-2 text-slate-200">
                    Perfect. We’ll unlock lessons as you pay-per-use and earn NFTs!
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-xl border border-emerald-300/30 bg-emerald-400/10" />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}