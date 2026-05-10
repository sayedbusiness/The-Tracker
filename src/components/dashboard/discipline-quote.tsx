"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { todayQuote } from "@/lib/mock-data";

export function DisciplineQuote() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-amber-500/[0.06] via-transparent to-rose-500/[0.06] p-5"
    >
      <Quote className="absolute -top-2 -right-2 h-24 w-24 rotate-12 text-white/[0.04]" />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400/70">
          Discipline · daily
        </div>
        <blockquote className="mt-2 text-lg font-medium leading-tight tracking-tight text-white sm:text-xl">
          "{todayQuote.text}"
        </blockquote>
        <div className="mt-3 text-[10px] uppercase tracking-[0.15em] text-slate-500">
          — {todayQuote.attr}
        </div>
      </div>
    </motion.div>
  );
}
