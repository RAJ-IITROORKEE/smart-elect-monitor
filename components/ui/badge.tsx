import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive/15 text-destructive border border-destructive/30",
    outline: "border border-border text-foreground",
    success: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
