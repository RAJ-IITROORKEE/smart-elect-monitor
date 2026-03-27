import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  Bolt,
  Building2,
  Cpu,
  Database,
  Hotel,
  Network,
  Radio,
  School,
  Users,
} from "lucide-react";

const stack = [
  "Next.js 16",
  "TypeScript",
  "shadcn/ui",
  "Tailwind CSS",
  "MongoDB (planned)",
  "Prisma ORM (planned)",
  "ESP32",
  "Wi-Fi communication",
  "LoRaWAN ready",
];

const sectors = [
  { icon: School, title: "Institutions", desc: "Monitor classrooms, labs, and shared infrastructure efficiently." },
  { icon: Building2, title: "Hostels", desc: "Track floor-wise and block-wise usage with automation-ready control points." },
  { icon: Hotel, title: "Hotels", desc: "Improve guest comfort while reducing peak-hour operational wastage." },
];

const team = [
  {
    name: "Sagar Baruah",
    role: "Core Team Member",
    details: "Electronics and Communication, B.Tech 3rd Year, IIT Roorkee",
    email: "sagar_b@ece.iitr.ac.in",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center animate-fade-up">
        <Badge className="mb-4 border border-primary/30 bg-primary/10 text-primary">
          <Bolt className="mr-1.5 h-3 w-3" />
          About VoltEdge
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Smart Electricity Monitoring
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          VoltEdge is an IoT-based electricity monitoring system designed for efficient control
          and automation across hostels, institutions, and hotels.
          It uses standard ESP32 development boards with Wi-Fi communication for current deployments,
          while keeping the architecture ready for LoRaWAN-based scalability in future phases.
        </p>
      </div>

      <Separator className="my-10 opacity-50" />

      <section className="mb-10 animate-fade-up stagger-1">
        <h2 className="mb-4 text-2xl font-bold">Project Brief</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
                <Cpu className="h-4 w-4 text-primary" />
                Hardware + Communication
              </h3>
              <p className="text-sm text-muted-foreground">
                ESP32 nodes connect with sensors and stream power parameters over Wi-Fi for real-time
                operational monitoring. LoRaWAN support will be included in later releases for larger campus-scale deployment.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-5">
              <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
                <Network className="h-4 w-4 text-primary" />
                Platform Vision
              </h3>
              <p className="text-sm text-muted-foreground">
                The dashboard delivers visibility into load behavior, real-time analysis, alerts,
                and automation-ready controls to reduce energy wastage while preserving reliability.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10 animate-fade-up stagger-2">
        <h2 className="mb-4 text-2xl font-bold">Target Environments</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {sectors.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-border/60">
              <CardContent className="p-5">
                <span className="mb-3 inline-flex rounded-lg bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10 animate-fade-up stagger-3">
        <h2 className="mb-4 text-2xl font-bold">Technology Stack</h2>
        <div className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <Badge key={item} variant="outline" className="text-xs font-medium">
              {item}
            </Badge>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-border/60 bg-card p-4 text-sm text-muted-foreground">
          <p className="inline-flex items-start gap-2">
            <Database className="mt-0.5 h-4 w-4 text-primary" />
            Database and ORM setup will use MongoDB and Prisma in the next implementation phase.
          </p>
        </div>
      </section>

      <section className="animate-fade-up stagger-4">
        <h2 className="mb-4 text-2xl font-bold">Team</h2>
        <div className="grid gap-4 md:grid-cols-1">
          {team.map((member) => (
            <Card key={member.name} className="border-border/60">
              <CardContent className="p-5">
                <div className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  {member.role}
                </div>
                <h3 className="text-base font-semibold">{member.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{member.details}</p>
                <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            Communication baseline: ESP32 + Wi-Fi | Upgrade path: LoRaWAN for optimized scalability.
          </p>
        </div>
      </section>
    </div>
  );
}
