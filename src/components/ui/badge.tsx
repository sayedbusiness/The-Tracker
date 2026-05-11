import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.06] text-slate-300 border border-white/[0.06]",
        violet: "bg-blue-600/15 text-blue-300 border border-blue-600/20",
        emerald: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
        cyan: "bg-sky-500/15 text-sky-300 border border-sky-500/20",
        amber: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
        rose: "bg-rose-500/15 text-rose-300 border border-rose-500/20",
        indigo: "bg-blue-600/15 text-blue-300 border border-blue-600/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
