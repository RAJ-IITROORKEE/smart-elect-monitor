import { Droplets, Cpu, Satellite, ShieldCheck, Users, Zap, Globe, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: Satellite,
    title: "LoRaWAN + TTN Integration",
    desc: "Long-range, low-power IoT nodes transmit pH, TDS, and temperature data using LoRa radio to The Things Network cloud infrastructure.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Prediction",
    desc: "A Random Forest classifier trained on 3,276 water samples predicts potability in real-time, with safety scoring, cause detection, and trend analysis.",
  },
  {
    icon: ShieldCheck,
    title: "Real-Time Alerts",
    desc: "Instant UI alerts when unsafe water conditions are detected — with detailed cause identification and actionable remediation guidance.",
  },
  {
    icon: Globe,
    title: "Rural Coverage",
    desc: "LoRa technology enables monitoring across terrain where cellular connectivity is unavailable, extending coverage to remote villages and farms.",
  },
  {
    icon: Zap,
    title: "Low-Power Nodes",
    desc: "ESP32 + LoRa SX1276 hardware transmits once per minute on battery power, enabling months of unattended operation per deployment.",
  },
  {
    icon: Users,
    title: "Built for Bharat",
    desc: "Designed specifically for Indian water bodies, agricultural zones, and municipal supply — addressing real contamination challenges India faces.",
  },
];

const team = [
  { name: "DualCode Team", role: "Full-Stack + ML Engineering" },
];

const techStack = [
  "Next.js 16", "TypeScript", "LoRaWAN", "TTN (The Things Network)",
  "ESP32 + SX1276", "Random Forest (scikit-learn)", "Recharts", "Tailwind CSS",
  "FastAPI (Python model server)", "Vercel",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center">
        <Badge className="mb-4 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15">
          <Award className="mr-1.5 h-3 w-3" />
          Microsoft AI Unlock Hackathon · AI for India Track
        </Badge>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          About{" "}
          <span className="gradient-text">JalRakshak.AI</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          &ldquo;Jal Rakshak&rdquo; — Guardian of Water. An IoT + AI system designed to monitor
          water quality across India&apos;s rivers, reservoirs, and distribution networks
          in real-time, making clean water intelligence accessible to all.
        </p>
      </div>

      <Separator className="my-10 opacity-40" />

      {/* Problem Statement */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-foreground">The Problem</h2>
        <div className="rounded-xl border border-border/60 bg-card p-6 text-muted-foreground leading-relaxed space-y-3">
          <p>
            Over <strong className="text-foreground">163 million Indians</strong> lack access to safe drinking water.
            Contamination from industrial discharge, agricultural runoff, and aging infrastructure
            affects millions of rural and urban communities.
          </p>
          <p>
            Traditional water testing is <strong className="text-foreground">slow, expensive, and infrequent</strong> —
            lab results take days, and field kits require trained personnel. Communities
            often discover contamination only after illness spreads.
          </p>
          <p>
            We need <strong className="text-foreground">affordable, continuous, automated monitoring</strong> that
            works even in remote areas without reliable internet — and that turns raw sensor
            data into actionable intelligence.
          </p>
        </div>
      </section>

      {/* Solution */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Our Solution</h2>
        <p className="mb-6 text-muted-foreground">
          JalRakshak.AI combines low-cost LoRaWAN IoT sensors with a machine learning model
          to deliver real-time water quality intelligence at scale. The system:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/60">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-foreground">How It Works</h2>
        <div className="space-y-3">
          {[
            { step: "1", title: "Sensor Node", desc: "ESP32 microcontroller reads pH, TDS, and water temperature sensors and encodes them into 6 bytes." },
            { step: "2", title: "LoRaWAN Transmission", desc: "LoRa SX1276 radio transmits the payload over long range (up to 10km) to a TTN gateway." },
            { step: "3", title: "TTN Uplink", desc: "The Things Network decodes the payload using a JavaScript formatter and forwards it to our webhook." },
            { step: "4", title: "AI Analysis", desc: "Our Random Forest model predicts potability; threshold-based analysis generates safety scores, cause detection, and trend forecasts." },
            { step: "5", title: "Dashboard Display", desc: "The Next.js dashboard polls the API every 60 seconds, rendering live device cards with predictions and charts." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 rounded-xl border border-border/40 bg-card p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {step}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          {techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs font-medium">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Team</h2>
        {team.map(({ name, role }) => (
          <div key={name} className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
            <Badge className="ml-auto bg-amber-500/10 text-amber-500 border-amber-500/30">
              Hackathon 2026
            </Badge>
          </div>
        ))}
      </section>
    </div>
  );
}
