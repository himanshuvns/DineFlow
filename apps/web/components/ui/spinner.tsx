import * as React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-emerald-500 border-t-transparent",
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
}
