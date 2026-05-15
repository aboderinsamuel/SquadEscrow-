"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ember" | "outline" | "dark" | "forest";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  loading?: boolean;
}

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-[transform,background,box-shadow,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-200 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-coral-500 text-cream-50 shadow-pop hover:bg-coral-400",
  secondary:
    "bg-ink text-cream-50 hover:bg-ink-800",
  outline:
    "bg-transparent text-ink ring-[1.5px] ring-inset ring-ink/80 hover:bg-ink/5",
  ghost:
    "bg-transparent text-ink/70 hover:text-ink hover:bg-ink/5",
  danger:
    "bg-coral-600 text-cream-50 hover:bg-coral-500",
  ember:
    "bg-gold-grad text-ink hover:brightness-105",
  dark:
    "bg-forest-900 text-cream-50 hover:bg-forest-800",
  forest:
    "bg-forest-500 text-cream-50 hover:bg-forest-600",
};

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-14 px-6 text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", block, loading, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      {...rest}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent opacity-80" />
        </span>
      )}
      <span className={cn("inline-flex items-center gap-1.5", loading && "opacity-0")}>{children}</span>
    </button>
  );
});
