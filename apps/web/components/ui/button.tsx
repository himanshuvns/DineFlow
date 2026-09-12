import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none rounded-xl";

    const variantStyles = {
      primary:
        "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98]",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 active:scale-[0.98]",
      outline:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98]",
      glow:
        "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
      md: "text-sm px-4 py-2.5 h-10 gap-2",
      lg: "text-base px-6 py-3.5 h-12 gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    const combinedClasses = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string; children?: React.ReactNode }>;
      return React.cloneElement(child, {
        className: cn(combinedClasses, child.props.className),
        children: (
          <>
            {leftIcon && <span className="inline-flex shrink-0 mr-1.5">{leftIcon}</span>}
            {child.props.children}
            {rightIcon && <span className="inline-flex shrink-0 ml-1.5">{rightIcon}</span>}
          </>
        ),
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
