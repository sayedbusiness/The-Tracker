"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, X, Check, FileText, ChevronDown } from "lucide-react";
import type { PipelineStage } from "@/lib/mock-data";

/**
 * Drag-and-drop CSV importer for leads.
 *
 * Accepts a CSV export from HubSpot, Apollo, Google Sheets — anything with
 * headers in row 1. Auto-detects columns by common header names, lets you
 * manually remap, then bulk-imports as pipeline deals.
 */

export interface ImportedLead {
  id: string;
  company: string;
  contact: string;
  value: number;
  stage: PipelineStage;
  probability: number;
  closeDate: string;
  source: string;
}

const FIELD_HINTS: Record<keyof Omit<ImportedLead, "id">, string[]> = {
  company: ["company", "company name", "account", "organization", "business"],
  contact: ["contact", "name", "first name", "full name", "person", "lead"],
  value: ["value", "amount", "deal amount", "deal value", "revenue", "mrr"],
  stage: ["stage", "deal stage", "status", "pipeline stage"],
  probability: ["probability", "likelihood", "confidence"],
  closeDate: ["close date", "expected close", "close", "deadline"],
  source: ["source", "lead source", "channel", "origin"],
};

const STAGE_NORMALIZE: Record<string, PipelineStage> = {
  lead: "lead",
  new: "lead",
  prospect: "lead",
  qualified: "qualified",
  contacted: "qualified",
  discovery: "qualified",
  meeting: "qualified",
  proposal: "proposal",
  proposed: "proposal",
  negotiation: "negotiation",
  negotiating: "negotiation",
  closing: "negotiation",
  won: "won",
  "closed won": "won",
  "closed-won": "won",
  lost: "lost",
  "closed lost": "lost",
  "closed-lost": "lost",
};

/** Minimal CSV parser — RFC4180-ish. Handles quoted cells, doubled "" escapes. */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(cur);
        cur = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += c;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/** Auto-map a header to a known field. */
function autoMap(header: string): keyof Omit<ImportedLead, "id"> | null {
  const h = header.toLowerCase().trim();
  for (const [field, hints] of Object.entries(FIELD_HINTS)) {
    if (hints.some((hint) => h === hint || h.includes(hint))) {
      return field as keyof Omit<ImportedLead, "id">;
    }
  }
  return null;
}

function parseMoney(raw: string): number {
  const cleaned = raw.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseStage(raw: string): PipelineStage {
  const k = raw.toLowerCase().trim();
  return STAGE_NORMALIZE[k] ?? "lead";
}

function parseProbability(raw: string): number {
  const n = parseMoney(raw);
  if (n <= 1 && n > 0) return Math.round(n * 100);
  return Math.min(100, Math.max(0, Math.round(n)));
}

interface Props {
  onImport: (leads: ImportedLead[]) => void;
  /** Optional externally-controlled open state — used to auto-open from the command palette. */
  openExternal?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export function LeadImporter({
  onImport,
  openExternal,
  onOpenChange,
}: Props) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openExternal ?? openInternal;
  const setOpen = (v: boolean) => {
    setOpenInternal(v);
    onOpenChange?.(v);
  };
  const [dragHover, setDragHover] = useState(false);
  const [filename, setFilename] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<
    Record<keyof Omit<ImportedLead, "id">, number | null>
  >({
    company: null,
    contact: null,
    value: null,
    stage: null,
    probability: null,
    closeDate: null,
    source: null,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFilename("");
    setHeaders([]);
    setRows([]);
    setMapping({
      company: null,
      contact: null,
      value: null,
      stage: null,
      probability: null,
      closeDate: null,
      source: null,
    });
  };

  const ingestFile = async (file: File) => {
    setFilename(file.name);
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length === 0) return;
    const [h, ...rest] = parsed;
    setHeaders(h);
    setRows(rest);
    const m: Record<keyof Omit<ImportedLead, "id">, number | null> = {
      company: null,
      contact: null,
      value: null,
      stage: null,
      probability: null,
      closeDate: null,
      source: null,
    };
    h.forEach((header, idx) => {
      const field = autoMap(header);
      if (field && m[field] === null) m[field] = idx;
    });
    setMapping(m);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragHover(false);
    const file = e.dataTransfer.files[0];
    if (file) ingestFile(file);
  }, []);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) ingestFile(file);
  };

  const preview = useMemo<ImportedLead[]>(() => {
    if (rows.length === 0) return [];
    return rows.slice(0, 5).map((r, i) => buildLead(r, mapping, i));
  }, [rows, mapping]);

  const importAll = () => {
    const all = rows.map((r, i) => buildLead(r, mapping, i));
    // Only import rows that have at least one of company / contact filled.
    const cleaned = all.filter(
      (l) => l.company.trim() !== "" || l.contact.trim() !== ""
    );
    onImport(cleaned);
    setOpen(false);
    reset();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
      >
        <Upload className="h-3.5 w-3.5" /> Import leads
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-3xl space-y-4 rounded-3xl border border-white/[0.08] bg-slate-950 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Import leads from CSV
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  HubSpot, Apollo, Google Sheets — anything with headers in row 1.
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {rows.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragHover(true);
                }}
                onDragLeave={() => setDragHover(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed py-12 text-center transition-colors ${
                  dragHover
                    ? "border-emerald-400/60 bg-emerald-500/10"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <Upload className="h-7 w-7 text-slate-400" />
                <div className="mt-3 text-sm font-medium text-white">
                  Drop a CSV file here, or click to browse
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  In HubSpot: Contacts → Export. In Google Sheets: File → Download → .csv.
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={onSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs">
                  <FileText className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="font-medium text-emerald-200">{filename}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">
                    {rows.length} row{rows.length === 1 ? "" : "s"} detected
                  </span>
                  <button
                    onClick={reset}
                    className="ml-auto text-slate-500 hover:text-rose-300"
                  >
                    change file
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(FIELD_HINTS) as Array<keyof Omit<ImportedLead, "id">>).map(
                    (field) => (
                      <ColumnPicker
                        key={field}
                        field={field}
                        headers={headers}
                        value={mapping[field]}
                        onChange={(v) => setMapping((m) => ({ ...m, [field]: v }))}
                      />
                    )
                  )}
                </div>

                <div>
                  <div className="mb-1.5 text-[10px] uppercase tracking-wider text-slate-500">
                    Preview · first 5 rows
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/[0.05] bg-black/30">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-slate-500">
                          <th className="px-3 py-2 text-left">Company</th>
                          <th className="px-3 py-2 text-left">Contact</th>
                          <th className="px-3 py-2 text-right">Value</th>
                          <th className="px-3 py-2 text-left">Stage</th>
                          <th className="px-3 py-2 text-left">Source</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((p, i) => (
                          <tr key={i} className="border-b border-white/[0.03]">
                            <td className="px-3 py-1.5 font-medium text-white">
                              {p.company || "—"}
                            </td>
                            <td className="px-3 py-1.5 text-slate-300">
                              {p.contact || "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right tabular text-emerald-300">
                              {p.value > 0 ? `$${p.value.toLocaleString()}` : "—"}
                            </td>
                            <td className="px-3 py-1.5 text-slate-300">{p.stage}</td>
                            <td className="px-3 py-1.5 text-slate-400">
                              {p.source || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      reset();
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={importAll}
                    disabled={mapping.company === null && mapping.contact === null}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(16,185,129,0.4)] disabled:opacity-40"
                  >
                    <Check className="h-3.5 w-3.5" /> Import {rows.length} lead
                    {rows.length === 1 ? "" : "s"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

function ColumnPicker({
  field,
  headers,
  value,
  onChange,
}: {
  field: string;
  headers: string[];
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs">
      <span className="w-20 shrink-0 capitalize text-slate-400">{field}</span>
      <div className="relative flex-1">
        <select
          value={value === null ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? null : Number(e.target.value))
          }
          className="w-full appearance-none rounded-md border border-white/[0.08] bg-black/30 px-2 py-1 pr-6 text-white"
        >
          <option value="" className="bg-slate-900">
            — skip —
          </option>
          {headers.map((h, i) => (
            <option key={i} value={i} className="bg-slate-900">
              {h}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 text-slate-500" />
      </div>
    </label>
  );
}

function buildLead(
  row: string[],
  mapping: Record<keyof Omit<ImportedLead, "id">, number | null>,
  i: number
): ImportedLead {
  const get = (k: keyof Omit<ImportedLead, "id">) => {
    const idx = mapping[k];
    if (idx === null || idx === undefined) return "";
    return (row[idx] ?? "").trim();
  };
  const valueRaw = get("value");
  const probabilityRaw = get("probability");
  return {
    id: `imp-${Date.now()}-${i}`,
    company: get("company"),
    contact: get("contact"),
    value: parseMoney(valueRaw),
    stage: parseStage(get("stage")),
    probability: probabilityRaw ? parseProbability(probabilityRaw) : 25,
    closeDate: get("closeDate") || new Date().toISOString().slice(0, 10),
    source: get("source") || "Imported",
  };
}
