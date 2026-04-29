import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BadgeCheck,
  Bolt,
  Building2,
  Cpu,
  Database,
  Hotel,
  Network,
  School,
  Users,
  Zap,
  Wifi,
  Gauge,
  Eye,
  BellRing,
  BarChart3,
  Shield,
  Award,
  Mail,
} from "lucide-react";

const techBadges = [
  { label: "ESP32", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", icon: Cpu },
  { label: "WiFi", color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: Wifi },
  { label: "IoT", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300", icon: Network },
  { label: "DHT22 Sensor", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", icon: Gauge },
  { label: "Real-time Monitoring", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", icon: Eye },
  { label: "Next.js 16", color: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300", icon: Zap },
];

const keyFeatures = [
  { 
    icon: Gauge, 
    title: "Live Monitoring", 
    desc: "Real-time temperature, humidity, and occupancy tracking with auto-refresh dashboard",
    color: "text-blue-500"
  },
  { 
    icon: Eye, 
    title: "PIR Motion Detection", 
    desc: "Automatic room occupancy detection with 20-second timeout for accurate presence tracking",
    color: "text-green-500"
  },
  { 
    icon: Zap, 
    title: "Remote Control", 
    desc: "Toggle LED lights and PIR sensor remotely from dashboard with instant feedback",
    color: "text-yellow-500"
  },
  { 
    icon: BellRing, 
    title: "Smart Alerts", 
    desc: "Get notified when lights are on in unoccupied rooms to save energy",
    color: "text-red-500"
  },
  { 
    icon: BarChart3, 
    title: "Visual Analytics", 
    desc: "SVG line graphs with color-coded data points and 24-hour statistics",
    color: "text-purple-500"
  },
  { 
    icon: Shield, 
    title: "Admin Panel", 
    desc: "Secure admin dashboard for device management, analytics, and user contacts",
    color: "text-indigo-500"
  },
];

const stack = [
  "Next.js 16",
  "TypeScript",
  "shadcn/ui",
  "Tailwind CSS",
  "MongoDB (planned)",
  "Prisma ORM (planned)",
  "ESP32",
  "DHT22 Sensor",
  "PIR Motion Sensor",
  "OLED Display",
  "Wi-Fi Communication",
  "ArduinoJson",
];

const sectors = [
  { icon: School, title: "Institutions", desc: "Monitor classrooms, labs, and shared infrastructure efficiently." },
  { icon: Building2, title: "Hostels", desc: "Track floor-wise and block-wise usage with automation-ready control points." },
  { icon: Hotel, title: "Hotels", desc: "Improve guest comfort while reducing peak-hour operational wastage." },
];

const supervisor = {
  name: "Dr. Rajib Kumar Panigrahi",
  role: "Project Supervisor & Mentor",
  designation: "Assistant Professor",
  department: "Electronics and Communication Engineering (ECE)",
  institution: "Indian Institute of Technology, Roorkee",
  color: "bg-gradient-to-br from-amber-500 to-orange-600",
  initials: "RKP"
};

const team = [
  {
    name: "Sagar Baruah",
    role: "Core Team Member",
    details: "B.Tech 3rd Year, Electronics and Communication Engineering",
    institution: "IIT Roorkee",
    email: "sagar_b@ece.iitr.ac.in",
    color: "bg-gradient-to-br from-blue-500 to-cyan-600",
    initials: "SB"
  },
  {
    name: "Chintapalli Ponting",
    role: "Core Team Member",
    details: "B.Tech 3rd Year, Electronics and Communication Engineering",
    institution: "IIT Roorkee",
    email: "Chintapalli_p@ece.iitr.ac.in",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    initials: "CP"
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
          It uses ESP32 development boards with Wi-Fi communication, DHT22 sensors for temperature & humidity monitoring,
          and PIR motion detection for smart occupancy tracking with remote LED control capabilities.
        </p>
      </div>

      {/* Tech Stack Badges */}
      <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up stagger-1">
        {techBadges.map(({ label, color, icon: Icon }) => (
          <Badge key={label} className={`${color} flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Badge>
        ))}
      </div>

      <Separator className="my-10 opacity-50" />

      {/* Key Features */}
      <section className="mb-10 animate-fade-up stagger-2">
        <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          Key Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {keyFeatures.map(({ icon: Icon, title, desc, color }) => (
            <Card key={title} className="border-border/60 hover:border-primary/30 transition-all">
              <CardContent className="p-5">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="text-sm font-semibold mb-2">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-10 opacity-50" />

      <section className="mb-10 animate-fade-up stagger-3">
        <h2 className="mb-4 text-2xl font-bold">Project Brief</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
                <Cpu className="h-4 w-4 text-primary" />
                Hardware + Communication
              </h3>
              <p className="text-sm text-muted-foreground">
                ESP32 nodes with DHT22 sensors and PIR motion detectors stream temperature, humidity, and occupancy data over Wi-Fi 
                for real-time operational monitoring. Remote LED control enables energy-saving automation.
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
                The dashboard delivers visibility into weather patterns, occupancy behavior, real-time analysis, 
                smart alerts, and automation-ready controls to reduce energy wastage while preserving comfort.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-10 animate-fade-up stagger-4">
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

      <section className="mb-10 animate-fade-up stagger-5">
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

      <Separator className="my-10 opacity-50" />

      {/* Team Section */}
      <section className="animate-fade-up stagger-6">
        <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Team
        </h2>

        {/* Project Supervisor */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-foreground">Project Supervisor & Mentor</h3>
          </div>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`${supervisor.color} text-white text-lg font-bold`}>
                    {supervisor.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-foreground">{supervisor.name}</h4>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-1">
                    {supervisor.designation}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {supervisor.department}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {supervisor.institution}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Team Members */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Core Team Members</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {team.map((member) => (
              <Card key={member.name} className="border-border/60 hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className={`${member.color} text-white text-base font-bold`}>
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-foreground">{member.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{member.details}</p>
                      <p className="text-xs text-muted-foreground">{member.institution}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${member.email}`} className="hover:underline">
                          {member.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            WiFi-based IoT monitoring with ESP32 for real-time weather and occupancy tracking with remote control capabilities.
          </p>
        </div>
      </section>
    </div>
  );
}
