"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn("w-full space-y-1", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 block tracking-tight select-none"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center rounded-2xl border transition-all duration-200",
            "bg-slate-100/90 dark:bg-[#0F172A]/70 backdrop-blur-md",
            "border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600",
            "focus-within:border-emerald-500 dark:focus-within:border-[#14F1C7]",
            "focus-within:ring-2 focus-within:ring-emerald-500/20 dark:focus-within:ring-[#14F1C7]/40",
            "focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:focus-within:shadow-[0_0_20px_rgba(20,241,199,0.22)]",
            error && "border-rose-500/70 focus-within:border-rose-500 focus-within:ring-rose-500/20"
          )}
        >
          {leftIcon && (
            <div className="flex items-center pl-3.5 pr-1 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-[#14F1C7] transition-colors pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-transparent text-[14px] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-colors",
              "py-2 sm:py-2.5",
              leftIcon ? "pl-2" : "pl-3.5",
              rightIcon ? "pr-2" : "pr-3.5",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="flex items-center pr-3 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-500 pl-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] pl-1 leading-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
