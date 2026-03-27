import { Activity, Bolt, Building2, Clock3, Lightbulb, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const statusCards = [
  { title: "Total Meters", value: "64", note: "Mapped across blocks and floors", icon: Activity },
  { title: "Live Zones", value: "51", note: "Currently reporting via Wi-Fi", icon: Bolt },
  { title: "Automated Schedules", value: "27", note: "Night cut-off and peak balancing", icon: Clock3 },
  { title: "Estimated Daily Savings", value: "11.8%", note: "From automation opportunities", icon: TrendingUp },
];

const sections = [
  {
    title: "Energy Nodes",
    text: "List all ESP32 meter nodes with zone mapping, live status, and calibration metadata.",
  },
  {
    title: "Realtime Analysis",
    text: "Timeline cards and trend charts for per-floor load, anomalies, and demand spikes.",
  },
  {
    title: "Contact Requests",
    text: "Requests and support queue for institutions, hostels, and hotels.",
  },
  {
    title: "Notifications",
    text: "Critical and warning alerts for peak overrun, idle load, and policy breaches.",
  },
  {
    title: "Docs",
    text: "Circuit diagram placeholder, code generator placeholder, and Arduino setup placeholder.",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Frontend structure preview for Smart Electricity Monitor control center
          </p>
        </div>
        <Badge className="border border-primary/30 bg-primary/10 text-primary">
          <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
          Backend Integration In Progress
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map(({ title, value, note, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                {title}
                <Icon className="h-4 w-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Panel Structure</CardTitle>
          <CardDescription>
            Sidebar modules and page blocks aligned with the reference style and shadcn composition.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                {section.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{section.text}</p>
              <p className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                Currently in progress
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
