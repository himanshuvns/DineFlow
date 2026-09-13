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
      <div className={cn("w-full space-y-1.5", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-slate-300 block tracking-tight select-none"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            "group relative flex items-center rounded-2xl border transition-all duration-200",
            "bg-[#0F172A]/70 backdrop-blur-md",
            "border-slate-700/60 hover:border-slate-600",
            "focus-within:border-[#14F1C7] focus-within:ring-1 focus-within:ring-[#14F1C7]/40 focus-within:shadow-[0_0_20px_rgba(20,241,199,0.22)]",
            error && "border-rose-500/70 focus-within:border-rose-400 focus-within:ring-rose-500/30"
          )}
        >
          {leftIcon && (
            <div className="flex items-center pl-4 pr-1 text-slate-400 group-focus-within:text-[#14F1C7] transition-colors pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-transparent text-[14px] text-[#F8FAFC] placeholder:text-slate-500 outline-none transition-colors",
              "py-3.5",
              leftIcon ? "pl-2.5" : "pl-4",
              rightIcon ? "pr-2" : "pr-4",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="flex items-center pr-3.5 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-rose-400 pl-1">{error}</p>
        ) : helperText ? (
          <p className="text-[13px] text-[#94A3B8] pl-1 leading-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
