"use client";

import * as React from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  rightIcon?: React.ReactNode;
}

export const CTAButton = React.forwardRef<HTMLButtonElement, CTAButtonProps>(
  (
    {
      children,
      className,
      isLoading = false,
      rightIcon = <ArrowRight className="h-4 w-4 stroke-[2.5]" />,
      disabled,
      type = "submit",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          "group relative w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-[15px] select-none cursor-pointer tracking-tight transition-all duration-200",
          "bg-gradient-to-r from-[#14F1C7] via-[#10E4BD] to-[#00D4AA] text-[#020617]",
          "shadow-[0_4px_24px_rgba(20,241,199,0.35)]",
          "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_8px_32px_rgba(20,241,199,0.5)]",
          "active:scale-[0.98] active:translate-y-0",
          "focus:outline-none focus:ring-2 focus:ring-[#14F1C7] focus:ring-offset-2 focus:ring-offset-[#020617]",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:hover:shadow-none",
          className
        )}
        {...props}
      >
        {/* Subtle shine highlight */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-[#020617]" />
            <span>Creating Workspace…</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            {rightIcon && (
              <span className="transition-transform duration-200 group-hover:translate-x-1">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

CTAButton.displayName = "CTAButton";
