"use client";

import { motion } from "motion/react";

const stats = [
  { k: "15K+", v: "Lessons Completed" },
  { k: "8.2K", v: "NFT Badges Minted" },
  { k: "3.7K", v: "ENS Identities Reserved" },
  { k: "42%", v: "Faster Completion w/ Buddy" },
];

export default function Stats() {
  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-center backdrop-blur-sm sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.v} className="flex flex-col">
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
                {s.k}
              </span>
              <span className="text-slate-400 text-xs">{s.v}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}