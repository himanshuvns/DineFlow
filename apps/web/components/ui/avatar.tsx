import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "busy";
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeStyles = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const statusColors = {
    online: "bg-emerald-500 ring-slate-900",
    offline: "bg-slate-500 ring-slate-900",
    busy: "bg-amber-500 ring-slate-900",
  };

  const safeFallback = typeof fallback === "string" ? fallback.trim() : "";
  const initials = safeFallback
    ? safeFallback
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0] || "")
        .join("")
        .substring(0, 2)
        .toUpperCase() || "DF"
    : "DF";

  return (
    <div className={cn("relative inline-block shrink-0", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-slate-800 font-semibold text-slate-200 border border-slate-700/80 overflow-hidden shadow-inner",
          sizeStyles[size]
        )}
      >
        {src && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
