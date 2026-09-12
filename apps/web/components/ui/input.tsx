import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
            className={cn(
              "w-full rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "glass-input px-3.5 py-2.5 outline-none transition-all duration-200",
              "focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500",
              leftIcon ? "pl-11" : "",
              rightIcon ? "pr-11" : "",
              error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 flex items-center text-slate-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
