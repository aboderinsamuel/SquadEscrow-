"use client";
import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
}

const fieldBase =
  "w-full rounded-2xl bg-cream-50 px-4 py-3 text-[15px] text-ink placeholder:text-ink/35 ring-1 ring-inset ring-ink/15 outline-none transition-shadow focus:ring-ink focus:bg-cream-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(function Input(
  { label, hint, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">{label}</div>}
      <input
        ref={ref}
        {...rest}
        className={cn(fieldBase, "h-12", error && "ring-coral-500", className)}
      />
      {(hint || error) && (
        <div className={cn("mt-1.5 text-[12px]", error ? "text-coral-600" : "text-ink/50")}>{error || hint}</div>
      )}
    </label>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea(
  { label, hint, error, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">{label}</div>}
      <textarea
        ref={ref}
        {...rest}
        className={cn(fieldBase, "min-h-[120px] resize-y leading-relaxed", error && "ring-coral-500", className)}
      />
      {(hint || error) && (
        <div className={cn("mt-1.5 text-[12px]", error ? "text-coral-600" : "text-ink/50")}>{error || hint}</div>
      )}
    </label>
  );
});
