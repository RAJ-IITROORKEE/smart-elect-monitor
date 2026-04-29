"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: string
    color?: string
  }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const chartId = React.useId()
  const resolvedId = `chart-${id ?? chartId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={resolvedId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-layer]:outline-none",
          className
        )}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .filter(([, value]) => value.color)
              .map(([key, value]) => `[data-chart=${resolvedId}] { --color-${key}: ${value.color}; }`)
              .join("\n"),
          }}
        />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  className,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  className?: string
}) {
  const { config } = useChart()

  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background px-3 py-2 text-xs shadow-sm", className)}>
      <p className="mb-1 text-muted-foreground">{String(label ?? "")}</p>
      <div className="space-y-1">
        {payload.map((item) => {
          const key = String(item.dataKey)
          const labelText = config[key]?.label ?? key
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{labelText}</span>
              <span className="font-mono text-foreground">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip }
