"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MealAnalysis {
  name: string;
  ingredients: string[];
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  portion_estimate: string;
  confidence: number;
  notes?: string;
}

export function PhotoMealScanner({
  onLogged,
}: {
  onLogged?: (meal: MealAnalysis) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFile = async (file: File) => {
    setError(null);
    setStatus("uploading");
    setPreview(URL.createObjectURL(file));

    let toSend: Blob = file;
    // Auto-downscale large photos so iPhone HEIC/Live photos don't fail
    // the 8 MB cap on the API route.
    if (file.size > 1.5 * 1024 * 1024) {
      try {
        toSend = await downscaleImage(file, 1600, 0.85);
      } catch {
        // Couldn't decode (e.g. HEIC on a non-Safari browser) — try
        // sending the original and let the server tell us.
      }
    }

    const fd = new FormData();
    fd.append("photo", toSend, "meal.jpg");

    try {
      const res = await fetch("/api/vision/meal", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as MealAnalysis;
      setResult(data);
      setStatus("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Vision failed — try typing instead";
      setError(message);
      setStatus("idle");
      toast.error(message.slice(0, 120));
    }
  };

  const confirmLog = () => {
    if (!result) return;
    onLogged?.(result);
    toast.success(`Logged: ${result.name} · ${result.calories} kcal`);
    reset();
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />

      <Button
        size="md"
        data-photo-meal-trigger
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
      >
        <Camera className="h-4 w-4" />
        Scan photo
      </Button>

      <AnimatePresence>
        {(preview || result) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={status !== "uploading" ? reset : undefined}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-500">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    Meal vision · Gemini 2.5
                  </span>
                </div>
                <button
                  onClick={reset}
                  disabled={status === "uploading"}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5">
                {preview && (
                  <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/[0.05]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt="Meal preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {status === "uploading" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                        <Loader2 className="h-7 w-7 animate-spin text-blue-300" />
                        <span className="text-xs font-medium text-slate-200">
                          Analyzing portions, ingredients, macros…
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="cyan">{result.meal_type}</Badge>
                        <Badge variant="violet">
                          {Math.round(result.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {result.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {result.portion_estimate}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <Macro label="kcal" value={result.calories} color="rose" />
                      <Macro label="P" value={`${result.protein_g}g`} color="emerald" />
                      <Macro label="C" value={`${result.carbs_g}g`} color="amber" />
                      <Macro label="F" value={`${result.fat_g}g`} color="violet" />
                    </div>

                    {result.ingredients?.length > 0 && (
                      <div>
                        <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                          Ingredients
                        </div>
                        <ul className="space-y-1">
                          {result.ingredients.map((ing) => (
                            <li
                              key={ing}
                              className="flex items-center gap-2 text-xs text-slate-300"
                            >
                              <span className="h-1 w-1 rounded-full bg-sky-400" />
                              {ing}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.notes && (
                      <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-2 text-[11px] leading-relaxed text-amber-200/80">
                        {result.notes}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="primary" className="flex-1" onClick={confirmLog}>
                        <Check className="h-4 w-4" /> Log this meal
                      </Button>
                      <Button variant="secondary" onClick={reset}>
                        Retake
                      </Button>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/[0.06] p-3 text-xs text-rose-200">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Decode a File to a canvas, resize to fit within `maxDim` px on the
 * longer edge, and re-encode as JPEG at the requested quality. Falls
 * back to throwing if the browser can't decode the input (e.g. HEIC
 * outside Safari).
 */
async function downscaleImage(
  file: File,
  maxDim: number,
  quality: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    // Fallback for browsers without createImageBitmap on this codec
    throw new Error("decode-fail");
  });
  const longer = Math.max(bitmap.width, bitmap.height);
  const scale = longer > maxDim ? maxDim / longer : 1;
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode-fail"))),
      "image/jpeg",
      quality
    )
  );
}

function Macro({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "rose" | "emerald" | "amber" | "violet";
}) {
  const colors = {
    rose: "text-rose-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    violet: "text-blue-300",
  };
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-2 text-center">
      <div className={`text-base font-bold tabular ${colors[color]}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
