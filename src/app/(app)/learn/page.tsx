"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  Trophy,
  Sparkles,
  BookOpen,
  Flame,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/tasks/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { learningTracks } from "@/lib/mock-data";

const coverGradients = {
  violet: "from-blue-600 via-blue-600 to-blue-700",
  cyan: "from-sky-500 via-blue-500 to-blue-700",
  emerald: "from-emerald-500 via-teal-500 to-sky-600",
  amber: "from-amber-500 via-orange-500 to-rose-500",
  rose: "from-rose-500 via-pink-500 to-blue-700",
  indigo: "from-blue-600 via-blue-600 to-blue-700",
};

export default function LearnPage() {
  const inProgress = learningTracks.filter(
    (t) => t.progress > 0 && t.progress < 1
  );
  const completed = learningTracks.filter((t) => t.progress === 1);
  const totalHrs = learningTracks.reduce(
    (sum, t) =>
      sum + parseInt(t.duration.split("h")[0]) * t.progress,
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Learning · Second brain"
        title={
          <>
            Read. Watch. <span className="gradient-electric">Compound.</span>
          </>
        }
        subtitle="Curated content from the best operators and thinkers. The AI summarizes, quizzes, and surfaces what to study next based on your goals."
        icon={GraduationCap}
        accent="indigo"
        actions={
          <>
            <Button variant="secondary">
              <Plus className="h-4 w-4" /> Add resource
            </Button>
            <Button>
              <Sparkles className="h-4 w-4" /> AI study plan
            </Button>
          </>
        }
      />

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-4">
        <LearnStat
          icon={<BookOpen className="h-4 w-4" />}
          label="In progress"
          value={`${inProgress.length}`}
          sub="tracks active"
        />
        <LearnStat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={`${completed.length}`}
          sub="this year"
        />
        <LearnStat
          icon={<Clock className="h-4 w-4" />}
          label="Time logged"
          value={`${totalHrs.toFixed(1)}h`}
          sub="lifetime"
        />
        <LearnStat
          icon={<Flame className="h-4 w-4" />}
          label="Learning streak"
          value="0 days"
          sub="start today"
        />
      </section>

      {/* Continue watching hero */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-white">
          {inProgress.length > 0 ? "Pick up where you left off" : "Start your first track"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {(inProgress.length > 0 ? inProgress : learningTracks).slice(0, 2).map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="surface-elevated group relative overflow-hidden rounded-2xl"
            >
              <div
                className={`relative h-40 bg-gradient-to-br ${coverGradients[track.cover as keyof typeof coverGradients]} overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
                <div className="absolute inset-0 [background-image:linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="absolute bottom-3 left-3">
                  <Badge variant="default" className="bg-black/40 text-white">
                    {track.category}
                  </Badge>
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold tabular text-white backdrop-blur-sm">
                  {Math.round(track.progress * 100)}%
                </div>
                <button className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-xl">
                    <Play className="h-5 w-5 fill-white text-white" />
                  </div>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white">{track.title}</h3>
                <div className="mt-0.5 text-xs text-slate-400">
                  {track.instructor}
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {track.completed} / {track.lessons} lessons
                  </span>
                  <span>{track.duration}</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${track.progress * 100}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Library */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Your library</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              All
            </Button>
            <Button variant="ghost" size="sm">
              Mindset
            </Button>
            <Button variant="ghost" size="sm">
              Business
            </Button>
            <Button variant="ghost" size="sm">
              Health
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {learningTracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="surface-card group overflow-hidden rounded-2xl"
            >
              <div
                className={`relative h-28 bg-gradient-to-br ${coverGradients[track.cover as keyof typeof coverGradients]} overflow-hidden`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
                {track.progress === 1 && (
                  <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  {track.category}
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-semibold text-white">
                  {track.title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{track.duration}</span>
                  <span className="tabular">
                    {Math.round(track.progress * 100)}%
                  </span>
                </div>
                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-sky-400"
                    style={{ width: `${track.progress * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI summaries */}
      <section className="surface-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-400">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              AI summaries unlock with your first completed lesson
            </h3>
            <p className="text-[10px] text-slate-500">
              Watch, read, or listen to anything in the library, mark it complete, and the AI generates a structured recap + 5-question quiz.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-sm leading-relaxed text-slate-400">
          Recommended first track for you:{" "}
          <b className="text-white">High-Performance Sleep & Recovery</b> — sleep
          quality is the single highest-leverage variable for body composition
          (your stated goal). 4h 12m, 12 lessons.
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button size="sm" variant="primary">
            <Sparkles className="h-3 w-3" /> Start track
          </Button>
          <Button size="sm" variant="secondary">
            Browse library
          </Button>
        </div>
      </section>
    </div>
  );
}

function LearnStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="surface-card rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600/15 text-blue-300">
          {icon}
        </div>
        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold tabular text-white">{value}</div>
      <div className="mt-0.5 text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
