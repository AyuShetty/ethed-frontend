'use client';

import React from 'react';
import { ArrowRight, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import EthEdFeatures from './_components/features';

export default function EthEdHero() {
  return (
    <div className="bg-background relative w-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        {/* Eth blue/green radial gradient */}
        <div className="from-emerald-400/20 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div>
        <div className="bg-cyan-300/10 absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"></div>
      </div>
      {/* Global Grid is now handled at the layout level */}

      <div className="relative z-10 container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl" data-text-content>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 flex justify-center"
          >
            <div className="border-cyan-400/30 bg-black/80 inline-flex items-center rounded-full border px-3 py-1 text-sm backdrop-blur-sm badge" data-text-content>
              <span className="bg-emerald-400 mr-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                New
              </span>
              <span className="text-cyan-200">
                Web3 Learn &amp; Earn Platform launched!
              </span>
              <ChevronRight className="text-cyan-200 ml-1 h-4 w-4" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="from-cyan-300/90 via-slate-100/85 to-emerald-200/90 bg-gradient-to-tl bg-clip-text text-center text-4xl tracking-tighter text-balance text-transparent sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Get Rewarded for Learning <br />
            <span className="from-emerald-400 via-cyan-400 to-blue-500 bg-gradient-to-r bg-clip-text text-transparent">
              On EthEd, your progress is owned by you.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-300 mx-auto mt-6 max-w-2xl text-center text-lg"
          >
            EthEd helps you master blockchain from scratch—guided by AI, powered by real rewards. Earn points, NFT badges, and on-chain certificates as you learn. Sign up instantly (no wallet needed) and claim your unique ENS identity!
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row cta-buttons"
            data-text-content
          >
            <Button
              size="lg"
              className="group bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-900 hover:from-cyan-400 hover:to-blue-500 hover:text-white relative overflow-hidden rounded-full px-6 shadow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="from-blue-300 via-cyan-400/90 to-emerald-300/80 absolute inset-0 z-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-cyan-400/70 bg-black/30 flex items-center gap-2 rounded-full text-cyan-100 hover:bg-emerald-400/10 hover:text-white backdrop-blur-sm"
            >
              <GraduationCap className="h-4 w-4" />
              Browse Courses
            </Button>
          </motion.div>

          {/* Feature Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: 'spring',
              stiffness: 50,
            }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="border-cyan-300/20 bg-black/50 overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm">
              <div className="border-cyan-300/20 bg-slate-900/50 flex h-10 items-center border-b px-4">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-cyan-300"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                  <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                </div>
                <div className="bg-background/50 text-cyan-200 mx-auto flex items-center rounded-md px-3 py-1 text-xs">
                  https://ethed.app
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://i.postimg.cc/0yk8Vz7t/dashboard.webp"
                  alt="EthEd Platform Demo"
                  className="w-full"
                />
                <div className="from-background absolute inset-0 bg-gradient-to-t to-transparent opacity-0"></div>
              </div>
            </div>

            {/* Visual interest extras */}
            <div className="border-cyan-300/30 bg-slate-900/80 absolute -top-6 -right-6 h-12 w-12 rounded-lg border p-3 shadow-lg backdrop-blur-md">
              <div className="bg-emerald-400/20 h-full w-full rounded-md"></div>
            </div>
            <div className="border-cyan-200/20 bg-slate-900/80 absolute -bottom-4 -left-4 h-8 w-8 rounded-full border shadow-lg backdrop-blur-md"></div>
            <div className="border-cyan-200/20 bg-slate-900/80 absolute right-12 -bottom-6 h-10 w-10 rounded-lg border p-2 shadow-lg backdrop-blur-md">
              <div className="h-full w-full rounded-md bg-cyan-500/20"></div>
            </div>
          </motion.div>
        </div>
      </div>

      <EthEdFeatures/>
    </div>
  );
}
