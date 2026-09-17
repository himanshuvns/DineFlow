import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none rounded-xl active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20",
        primary:
          "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20",
        glow:
          "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02]",
        secondary:
          "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700",
        outline:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600",
        ghost:
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
        danger:
          "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20",
        destructive:
          "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20",
        link:
          "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "text-sm px-4 py-2.5 h-10 gap-2",
        sm: "text-xs px-3 py-1.5 h-8 gap-1.5",
        md: "text-sm px-4 py-2.5 h-10 gap-2",
        lg: "text-base px-6 py-3.5 h-12 gap-2.5",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size">,
    VariantProps<typeof buttonVariants> {
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
    const combinedClasses = cn(buttonVariants({ variant, size, className }));

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

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref as any}
        disabled={disabled || isLoading}
        className={combinedClasses}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            {children ? <span className="opacity-80 truncate">{children}</span> : null}
          </span>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 mr-1.5">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0 ml-1.5">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";
