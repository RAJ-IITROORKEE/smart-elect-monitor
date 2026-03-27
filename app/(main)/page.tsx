import { HeroSection } from "@/components/hero-section";
import { Activity, Bolt, Building2, Cpu, IndianRupee, Wifi } from "lucide-react";

const metricCards = [
  { title: "Active Blocks", value: "18", subtitle: "Across all monitored facilities", icon: Building2 },
  { title: "Current Demand", value: "312 kW", subtitle: "Live aggregate hostel + institution load", icon: Bolt },
  { title: "Estimated Daily Cost", value: "Rs 34,600", subtitle: "Projected from current usage curve", icon: IndianRupee },
  { title: "Automation Rules", value: "27", subtitle: "Schedules, threshold trips, and override flows", icon: Cpu },
];

const loadTrend = [42, 58, 67, 61, 74, 81, 76, 69, 73, 78, 66, 55];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HeroSection />

      <section className="mt-6 rounded-xl border border-border/60 bg-card/60 p-4 animate-fade-up stagger-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="inline-block h-2 w-2 animate-ping-slow rounded-full bg-emerald-500" />
            <Wifi className="h-3.5 w-3.5" />
            Live frontend preview mode enabled
          </p>
          <p className="text-xs text-muted-foreground">
            Layout-only dashboard for Smart Electricity Monitor (backend integrations will be added later)
          </p>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ title, value, subtitle, icon: Icon }, idx) => (
          <article
            key={title}
            className={`rounded-xl border border-border/60 bg-card p-4 shadow-sm animate-fade-up ${
              idx === 0 ? "stagger-1" : idx === 1 ? "stagger-2" : idx === 2 ? "stagger-3" : "stagger-4"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <span className="rounded-md bg-primary/10 p-2">
                <Icon className="h-4 w-4 text-primary" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-xl border border-border/60 bg-card p-5 animate-fade-up stagger-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-semibold">Realtime Analysis</h3>
            <span className="text-xs text-muted-foreground">Last 30 mins simulated load profile</span>
          </div>
          <div className="flex h-52 items-end gap-2 rounded-lg border border-border/50 bg-gradient-to-b from-primary/5 to-transparent p-4">
            {loadTrend.map((value, idx) => (
              <div key={idx} className="flex-1">
                <div
                  className="w-full rounded-t-md bg-primary/70 transition-all hover:bg-primary"
                  style={{ height: `${value * 1.5}px` }}
                />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border/60 bg-card p-5 animate-fade-up stagger-3">
          <h3 className="text-base font-semibold">Realtime Alerts</h3>
          <div className="mt-4 space-y-3">
            {[
              "Hostel Block C exceeded configured peak threshold",
              "Institution Lab Floor-2 running after auto-shutdown window",
              "Hotel HVAC circuit under optimization recommendation",
            ].map((item) => (
              <div key={item} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm text-muted-foreground">
                <p className="inline-flex items-start gap-2">
                  <Activity className="mt-0.5 h-4 w-4 text-primary" />
                  {item}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
