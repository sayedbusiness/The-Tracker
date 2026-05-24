"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Sparkles,
  Scan,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export type MealType =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snack"
  | "Fruit"
  | "Vegetable"
  | "Drink";

export interface LoggedMeal {
  id: string;
  meal: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  loggedAt: number;
}

const MEAL_TYPES: MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
  "Fruit",
  "Vegetable",
  "Drink",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (meal: LoggedMeal) => void;
}

type Mode = "manual" | "smart";

export function MealComposer({ open, onClose, onSave }: Props) {
  const [mode, setMode] = useState<Mode>("manual");

  // Manual fields
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("Snack");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);

  // Smart (text → macros via Gemini) fields
  const [smartText, setSmartText] = useState("");
  const [smartAmount, setSmartAmount] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const reset = () => {
    setName("");
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setMealType("Snack");
    setSmartText("");
    setSmartAmount("");
    setAnalyzing(false);
  };

  const closeAndReset = () => {
    reset();
    onClose();
  };

  const saveManual = () => {
    const n = name.trim();
    if (!n || calories <= 0) {
      toast.error("Add a name and calorie count");
      return;
    }
    onSave({
      id: `m-${Date.now()}`,
      meal: mealType,
      name: n,
      calories,
      protein,
      carbs,
      fat,
      time: nowTime(),
      loggedAt: Date.now(),
    });
    toast.success(`Logged: ${n} · ${calories} kcal`);
    closeAndReset();
  };

  const analyzeSmart = async () => {
    const text = smartText.trim();
    if (!text) {
      toast.error("Paste ingredients, a product name, or a barcode");
      return;
    }
    // Cap the text length so super-long ingredient lists don't blow
    // up the Gemini request — keep the first ~4000 chars (more than
    // enough for any normal package).
    const trimmedText = text.length > 4000 ? text.slice(0, 4000) + " …" : text;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/vision/text-meal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: trimmedText,
          amount: smartAmount.trim() || "1 serving",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Unknown" }));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as {
        name: string;
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "drink";
      };
      setName(data.name);
      setCalories(data.calories);
      setProtein(data.protein_g);
      setCarbs(data.carbs_g);
      setFat(data.fat_g);
      const cap =
        data.meal_type.charAt(0).toUpperCase() + data.meal_type.slice(1);
      setMealType(MEAL_TYPES.includes(cap as MealType) ? (cap as MealType) : "Snack");
      setMode("manual");
      toast.success("Estimated — pick a category if you want, then Save.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      toast.error(`Couldn't estimate: ${msg.slice(0, 80)} — type macros manually.`);
      // Switch to manual mode so the user isn't stuck.
      setMode("manual");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Pencil className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Log a meal
                </span>
              </div>
              <button
                onClick={closeAndReset}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Mode tabs */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] p-1">
                <ModeTab
                  active={mode === "manual"}
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  label="Type it"
                  onClick={() => setMode("manual")}
                />
                <ModeTab
                  active={mode === "smart"}
                  icon={<Scan className="h-3.5 w-3.5" />}
                  label="Barcode / ingredients"
                  onClick={() => setMode("smart")}
                />
              </div>

              {mode === "manual" ? (
                <div className="space-y-3">
                  <Field label="Meal name">
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chicken bowl with rice"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Type">
                      <select
                        value={mealType}
                        onChange={(e) =>
                          setMealType(e.target.value as LoggedMeal["meal"])
                        }
                        className={inputCls}
                      >
                        {MEAL_TYPES.map((m) => (
                          <option key={m} value={m} className="bg-slate-900">
                            {m}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Calories">
                      <input
                        type="number"
                        min={0}
                        value={calories || ""}
                        onChange={(e) => setCalories(Number(e.target.value) || 0)}
                        placeholder="0"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Protein (g)">
                      <input
                        type="number"
                        min={0}
                        value={protein || ""}
                        onChange={(e) => setProtein(Number(e.target.value) || 0)}
                        placeholder="0"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Carbs (g)">
                      <input
                        type="number"
                        min={0}
                        value={carbs || ""}
                        onChange={(e) => setCarbs(Number(e.target.value) || 0)}
                        placeholder="0"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Fat (g)">
                      <input
                        type="number"
                        min={0}
                        value={fat || ""}
                        onChange={(e) => setFat(Number(e.target.value) || 0)}
                        placeholder="0"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" className="flex-1" onClick={saveManual}>
                      <Check className="h-4 w-4" /> Save meal
                    </Button>
                    <Button variant="secondary" onClick={closeAndReset}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.05] p-3 text-[11px] text-sky-200/90">
                    <Badge variant="cyan" className="mr-1">AI</Badge>
                    Paste an ingredient list, the product name, or the
                    barcode number. Tell me how much you ate. I'll estimate
                    the macros — then you confirm + save.
                  </div>
                  <Field label="Ingredients / product name / barcode">
                    <textarea
                      autoFocus
                      value={smartText}
                      onChange={(e) => setSmartText(e.target.value)}
                      placeholder="e.g. RxBar chocolate chip · or paste an ingredients list · or a 12-digit barcode"
                      rows={3}
                      className={`${inputCls} min-h-[80px] resize-y`}
                    />
                  </Field>
                  <Field label="How much did you actually eat?">
                    <input
                      value={smartAmount}
                      onChange={(e) => setSmartAmount(e.target.value)}
                      placeholder="e.g. half a bar · 1 cup · 200g"
                      className={inputCls}
                    />
                  </Field>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={analyzeSmart}
                      disabled={analyzing || !smartText.trim()}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Estimating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Estimate macros
                        </>
                      )}
                    </Button>
                    <Button variant="secondary" onClick={closeAndReset}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-400/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>
      {children}
    </label>
  );
}

function ModeTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
        active
          ? "bg-blue-600/25 text-white shadow-[0_0_15px_rgba(30,58,138,0.4)] ring-1 ring-blue-400/30"
          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function nowTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
