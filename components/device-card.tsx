"use client";

import { DeviceReading, SensorReading } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Droplets,
  Thermometer,
  FlaskConical,
  Zap,
  Eye,
  Signal,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { SensorHistoryChart } from "@/components/sensor-history-chart";

interface DeviceCardProps {
  device: DeviceReading;
  history: SensorReading[];
}

function SensorMetric({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: number | null;
  unit: string;
  status?: "ok" | "warn" | "bad";
}) {
  const statusColor = {
    ok: "text-emerald-400",
    warn: "text-amber-400",
    bad: "text-red-400",
    undefined: "text-foreground",
  }[status ?? "undefined"];

  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-sm font-semibold tabular-nums", statusColor)}>
        {value != null ? `${value}` : "–"}{" "}
        <span className="text-xs font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}

function phStatus(ph: number | null): "ok" | "warn" | "bad" {
  if (ph == null) return "ok";
  if (ph >= 6.5 && ph <= 8.5) return "ok";
  if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return "warn";
  return "bad";
}

function tdsStatus(tds: number | null): "ok" | "warn" | "bad" {
  if (tds == null) return "ok";
  if (tds <= 300) return "ok";
  if (tds <= 500) return "warn";
  return "bad";
}

function turbidityStatus(t: number | null): "ok" | "warn" | "bad" {
  if (t == null) return "ok";
  if (t <= 3) return "ok";
  if (t <= 5) return "warn";
  return "bad";
}

function conductivityStatus(c: number | null): "ok" | "warn" | "bad" {
  if (c == null) return "ok";
  if (c <= 400) return "ok";
  if (c <= 600) return "warn";
  return "bad";
}

function formatRelativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function DeviceCard({ device, history }: DeviceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { prediction } = device;

  const isSafe = prediction?.water_status === "Safe";
  const safetyScore = prediction?.safety_score ?? null;
  const riskLevel = prediction?.risk_level;

  const scoreColor =
    safetyScore == null
      ? "bg-muted"
      : safetyScore >= 80
      ? "bg-emerald-500"
      : safetyScore >= 50
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden transition-all duration-300",
        prediction
          ? isSafe
            ? "glow-safe border-emerald-500/30"
            : "glow-unsafe border-red-500/30"
          : "border-border"
      )}
    >
      {/* Status accent bar on top */}
      <div
        className={cn(
          "h-1 w-full",
          prediction
            ? isSafe
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-red-500 to-rose-400"
            : "bg-gradient-to-r from-primary/50 to-primary/20"
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Water Quality Node</p>
            <CardTitle className="mt-0.5 truncate text-base">
              {device.deviceName ?? device.deviceId}
            </CardTitle>
          </div>

          {prediction ? (
            <Badge variant={isSafe ? "success" : "destructive"} className="shrink-0">
              {isSafe ? (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              ) : (
                <AlertTriangle className="mr-1 h-3 w-3" />
              )}
              {prediction.water_status}
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 text-muted-foreground">
              Pending
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatRelativeTime(device.timestamp)}</span>
          {device.rssi != null && (
            <>
              <span className="mx-1 text-border">·</span>
              <Signal className="h-3 w-3" />
              <span>{device.rssi} dBm</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {/* Safety Score */}
        {safetyScore != null && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Safety Score</span>
              <span className={cn("text-lg font-bold tabular-nums", isSafe ? "text-emerald-500" : "text-red-500")}>
                {safetyScore}/100
              </span>
            </div>
            <Progress
              value={safetyScore}
              className={cn("h-2.5", scoreColor)}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Confidence: {prediction?.confidence}</span>
              <Badge
                variant={
                  riskLevel === "Low" ? "success" : riskLevel === "Moderate" ? "warning" : "destructive"
                }
                className="text-[10px]"
              >
                {riskLevel} Risk
              </Badge>
            </div>
          </div>
        )}

        {/* Sensor readings */}
        <div className="grid grid-cols-1 gap-1.5">
          <SensorMetric
            icon={FlaskConical}
            label="pH Level"
            value={device.ph}
            unit=""
            status={phStatus(device.ph)}
          />
          <SensorMetric
            icon={Droplets}
            label="TDS"
            value={device.tds}
            unit="ppm"
            status={tdsStatus(device.tds)}
          />
          <SensorMetric
            icon={Eye}
            label="Turbidity"
            value={device.turbidity}
            unit="NTU"
            status={turbidityStatus(device.turbidity)}
          />
          <SensorMetric
            icon={Zap}
            label="Conductivity"
            value={device.conductivity}
            unit="μS/cm"
            status={conductivityStatus(device.conductivity)}
          />
          <SensorMetric
            icon={Thermometer}
            label="Temperature"
            value={device.temperature}
            unit="°C"
          />
        </div>

        {/* Future risk trend */}
        {prediction?.future_risk && (
          <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-xs">
            <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-muted-foreground">{prediction.future_risk}</p>
          </div>
        )}

        {/* Expand / collapse */}
        {prediction && (
          <>
            <button
              onClick={() => setExpanded((p) => !p)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/50 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide Analysis
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> View AI Analysis
                </>
              )}
            </button>

            {expanded && (
              <div className="space-y-4">
                <Separator />

                {/* Chart */}
                {history.length >= 2 && (
                  <SensorHistoryChart readings={history.slice(0, 20).reverse()} />
                )}

                {/* Possible causes */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Detected Issues
                  </p>
                  <ul className="space-y-1.5">
                    {prediction.possible_causes.map((cause, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                      >
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended Actions
                  </p>
                  <ul className="space-y-1.5">
                    {prediction.recommended_actions.map((action, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-lg bg-emerald-500/5 px-3 py-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
