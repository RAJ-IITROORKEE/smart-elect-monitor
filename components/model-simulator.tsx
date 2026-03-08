"use client";

import { useState } from "react";
import {
  FlaskConical, Play, Loader2, AlertTriangle,
  CheckCircle2, ChevronRight, Beaker, Activity,
  Droplets, Zap, Eye, TriangleAlert, Thermometer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { WaterPrediction } from "@/types";

// ── Parameter config ────────────────────────────────────────────────────────

interface Param {
  key: keyof SimInputs;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  safeRange: [number, number];
  icon: React.ReactNode;
  color: string;
  defaultVal: number;
}

interface SimInputs {
  ph: number;
  tds: number;
  turbidity: number;
  conductivity: number;
  temperature: number;
}

const PARAMS: Param[] = [
  {
    key: "ph",
    label: "pH Level",
    unit: "pH",
    min: 0,
    max: 14,
    step: 0.1,
    safeRange: [6.5, 8.5],
    icon: <Droplets className="h-4 w-4" />,
    color: "text-blue-400",
    defaultVal: 7.0,
  },
  {
    key: "tds",
    label: "Total Dissolved Solids",
    unit: "ppm",
    min: 0,
    max: 2000,
    step: 1,
    safeRange: [0, 500],
    icon: <Beaker className="h-4 w-4" />,
    color: "text-amber-400",
    defaultVal: 250,
  },
  {
    key: "turbidity",
    label: "Turbidity",
    unit: "NTU",
    min: 0,
    max: 20,
    step: 0.1,
    safeRange: [0, 5],
    icon: <Eye className="h-4 w-4" />,
    color: "text-purple-400",
    defaultVal: 2.0,
  },
  {
    key: "conductivity",
    label: "Conductivity",
    unit: "μS/cm",
    min: 0,
    max: 2000,
    step: 1,
    safeRange: [0, 600],
    icon: <Zap className="h-4 w-4" />,
    color: "text-emerald-400",
    defaultVal: 400,
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: 0,
    max: 50,
    step: 0.1,
    safeRange: [10, 30],
    icon: <Thermometer className="h-4 w-4" />,
    color: "text-orange-400",
    defaultVal: 25.0,
  },
];

function isSafe(key: keyof SimInputs, val: number): boolean {
  const p = PARAMS.find((p) => p.key === key)!;
  return val >= p.safeRange[0] && val <= p.safeRange[1];
}

// ── Result card helpers ──────────────────────────────────────────────────────

function riskColor(level: string) {
  if (level === "Low") return "text-emerald-400";
  if (level === "Moderate") return "text-amber-400";
  return "text-red-400";
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

// ── Main component ───────────────────────────────────────────────────────────

export function ModelSimulator({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [inputs, setInputs] = useState<SimInputs>({
    ph: 7.0,
    tds: 250,
    turbidity: 2.0,
    conductivity: 400,
    temperature: 25.0,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(WaterPrediction & { engine?: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string>("");

  function setVal(key: keyof SimInputs, val: number) {
    const p = PARAMS.find((p) => p.key === key)!;
    const clamped = Math.min(p.max, Math.max(p.min, val));
    setInputs((prev) => ({ ...prev, [key]: clamped }));
  }

  async function runSimulation() {
    setLoading(true);
    setError(null);
    setResult(null);
    setRawJson("");
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Prediction failed");
      setResult(data);
      setRawJson(JSON.stringify(data, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setInputs({ ph: 7.0, tds: 250, turbidity: 2.0, conductivity: 400, temperature: 25.0 });
    setResult(null);
    setError(null);
    setRawJson("");
  }

  if (!open) return null;

  return (
    <div className="mt-4 w-full">
      <Card className="border-primary/20 bg-card/60 backdrop-blur-sm shadow-lg">
        {/* Header */}
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
                <FlaskConical className="h-4.5 w-4.5 text-primary" />
              </span>
              <div>
                <CardTitle className="text-base">AI Model Simulator</CardTitle>
                <CardDescription className="text-xs">
                  Manually set sensor parameters and test the prediction model
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 ring-1 ring-emerald-500/20">
                <Activity className="h-3 w-3" />
                Railway · Python RF
              </span>
              <Button variant="ghost" size="sm" onClick={reset} className="h-8 px-2 text-xs text-muted-foreground">
                Reset
              </Button>
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close simulator"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="grid gap-6 lg:grid-cols-2">

            {/* ── Left: Parameter sliders ───────────────────────────── */}
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Input Parameters
              </p>

              {PARAMS.map((p) => {
                const val = inputs[p.key];
                const safe = isSafe(p.key, val);
                return (
                  <div key={p.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={p.color}>{p.icon}</span>
                        <span className="text-sm font-medium text-foreground">{p.label}</span>
                        <span
                          className={cn(
                            "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            safe
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          )}
                        >
                          {safe ? "Safe" : "Alert"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={val}
                          min={p.min}
                          max={p.max}
                          step={p.step}
                          onChange={(e) => setVal(p.key, parseFloat(e.target.value) || 0)}
                          className="w-20 rounded-md border border-border bg-background/60 px-2 py-1 text-right text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-xs text-muted-foreground w-10">{p.unit}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <Slider
                        min={p.min}
                        max={p.max}
                        step={p.step}
                        value={[val]}
                        onValueChange={([v]) => setVal(p.key, v)}
                      />
                      {/* Safe range indicator */}
                      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/50">
                        <span>{p.min}</span>
                        <span className="text-emerald-500/60">
                          Safe: {p.safeRange[0]}–{p.safeRange[1]}
                        </span>
                        <span>{p.max}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Run button */}
              <Button
                onClick={runSimulation}
                disabled={loading}
                className="w-full mt-2 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>

            {/* ── Right: Results ────────────────────────────────────── */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Analysis Output
              </p>

              {/* Idle state */}
              {!result && !error && !loading && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-14 text-center">
                  <FlaskConical className="mb-3 h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Set parameters and run simulation
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Results will appear here
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted/40" />
                  ))}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Prediction failed</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div className="space-y-4">

                  {/* Status + Score */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-xl border p-4",
                      result.water_status === "Safe"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    )}>
                      {result.water_status === "Safe"
                        ? <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                        : <TriangleAlert className="h-7 w-7 text-red-400" />
                      }
                      <span className={cn(
                        "text-base font-bold",
                        result.water_status === "Safe" ? "text-emerald-400" : "text-red-400"
                      )}>
                        {result.water_status}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Water Status</span>
                    </div>

                    <div className="flex flex-col justify-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Safety Score</span>
                        <span className="text-sm font-bold text-foreground">{result.safety_score}/100</span>
                      </div>
                      <Progress value={result.safety_score} className={cn("h-2", scoreColor(result.safety_score))} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Risk Level</span>
                        <span className={cn("text-xs font-semibold", riskColor(result.risk_level))}>
                          {result.risk_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence + Engine */}
                  <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/10 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Model Confidence</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{result.confidence}</span>
                      {result.engine && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {result.engine}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accordion — Causes, Actions, Future Risk, Raw JSON */}
                  <Accordion type="multiple" className="rounded-xl border border-border/50 px-4">

                    <AccordionItem value="causes">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2 text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Possible Causes ({result.possible_causes.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {result.possible_causes.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-amber-400/60" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="actions">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2 text-blue-400">
                          <Activity className="h-3.5 w-3.5" />
                          Recommended Actions ({result.recommended_actions.length})
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {result.recommended_actions.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-blue-400/60" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="future">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2 text-purple-400">
                          <Zap className="h-3.5 w-3.5" />
                          Future Risk Forecast
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {result.future_risk}
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="raw">
                      <AccordionTrigger>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Beaker className="h-3.5 w-3.5" />
                          Raw API Response
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 text-[11px] font-mono text-muted-foreground leading-relaxed">
                          {rawJson}
                        </pre>
                      </AccordionContent>
                    </AccordionItem>

                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
