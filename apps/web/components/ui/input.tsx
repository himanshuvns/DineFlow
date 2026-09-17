import * as React from "react";
import { cn } from "@/lib/utils";

import { CheckCircle2 } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isSuccess?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      isSuccess = false,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={cn(
              "w-full rounded-xl text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "glass-input px-3.5 py-2.5 outline-none transition-all duration-150",
              "focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500",
              leftIcon ? "pl-10" : "",
              rightIcon || isSuccess ? "pr-10" : "",
              error
                ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900 dark:text-rose-100"
                : isSuccess
                ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20"
                : "",
              className
            )}
            {...props}
          />
          {isSuccess && !rightIcon ? (
            <span className="absolute right-3 flex items-center text-emerald-500 pointer-events-none">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          ) : rightIcon ? (
            <span className="absolute right-3 flex items-center text-slate-400">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? (
          <span id={`${inputId}-error`} className="text-xs text-rose-500 dark:text-rose-400 font-medium">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
