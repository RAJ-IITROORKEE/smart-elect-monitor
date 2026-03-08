import { cn } from "@/lib/utils";
import { Activity, CheckCircle, XCircle, Database } from "lucide-react";

interface StatsBarProps {
  total: number;
  safe: number;
  unsafe: number;
  readings: number;
  className?: string;
}

export function StatsBar({ total, safe, unsafe, readings, className }: StatsBarProps) {
  const stats = [
    {
      label: "Total Devices",
      value: total,
      icon: Activity,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Safe Nodes",
      value: safe,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Alert Nodes",
      value: unsafe,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Total Readings",
      value: readings,
      icon: Database,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bg)}>
            <Icon className={cn("h-4.5 w-4.5", color)} />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground leading-none">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
