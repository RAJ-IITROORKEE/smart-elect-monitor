import { Bolt } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  compact?: boolean;
};

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/35",
          iconClassName
        )}
      >
        <Bolt className="h-4.5 w-4.5 text-primary" />
      </span>
      {!compact ? (
        <span className={cn("text-lg font-extrabold tracking-tight", textClassName)}>
          VoltEdge
        </span>
      ) : null}
    </div>
  );
}
