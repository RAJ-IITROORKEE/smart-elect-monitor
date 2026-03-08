import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Github, Globe, MessageCircle, Award, Radio } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <Badge className="mb-3 bg-primary/10 text-primary border border-primary/30">
          <MessageCircle className="mr-1.5 h-3 w-3" />
          Get in Touch
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Contact <span className="gradient-text">Us</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          JalRakshak.AI is a hackathon project by Team Dual Core, built for the
          Microsoft AI Unlock Hackathon — AI for India Track.
        </p>
      </div>

      {/* Project links grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/60">
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hackathon Project</p>
              <p className="text-sm font-semibold text-foreground">Microsoft AI Unlock Hackathon</p>
              <p className="text-xs text-muted-foreground">AI for India Track · 2026</p>
            </div>
          </CardContent>
        </Card>

        <a
          href="https://jalrakshak-ai-dualcore.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <Card className="border-border/60 transition-colors group-hover:border-primary/40 group-hover:bg-primary/5 h-full">
            <CardContent className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Live Dashboard</p>
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  jalrakshak-ai-dualcore.vercel.app
                </p>
                <p className="text-xs text-muted-foreground">Real-time water monitoring</p>
              </div>
            </CardContent>
          </Card>
        </a>

        <Card className="border-border/60">
          <CardContent className="flex gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <Radio className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">TTN Relay API</p>
              <p className="text-sm font-semibold text-foreground">iot-smart-park.vercel.app</p>
              <p className="text-xs font-mono text-muted-foreground">/api/ttn/jalrakshak-ai</p>
            </div>
          </CardContent>
        </Card>

        <a
          href="https://github.com/RAJ-IITROORKEE"
          target="_blank"
          rel="noopener noreferrer"
          className="group"
        >
          <Card className="border-border/60 transition-colors group-hover:border-foreground/30 group-hover:bg-muted/40 h-full">
            <CardContent className="flex gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Github className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Source Code</p>
                <p className="text-sm font-semibold text-foreground group-hover:underline">
                  github.com/RAJ-IITROORKEE
                </p>
                <p className="text-xs text-muted-foreground">JalRakshak-AI repository</p>
              </div>
            </CardContent>
          </Card>
        </a>
      </div>

      {/* Team contacts */}
      <h2 className="mt-10 mb-4 text-lg font-bold text-foreground">Team Dual Core</h2>
      <div className="space-y-3">
        {/* Leader */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/30 text-sm font-bold text-primary select-none">
              RR
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">Raj Rabidas</p>
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                  Leader
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">3rd Year B.Tech · Metallurgical &amp; Materials Engineering</p>
              <p className="text-xs text-muted-foreground">IIT Roorkee</p>
            </div>
            <a
              href="mailto:raj_r@mt.iitr.ac.in"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </CardContent>
        </Card>

        {/* Member */}
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-500/15 ring-2 ring-purple-500/30 text-sm font-bold text-purple-400 select-none">
              MR
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-foreground">Mansi Rajput</p>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">
                  Member
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">2nd Year B.Tech · Mechanical &amp; Industrial Engineering</p>
              <p className="text-xs text-muted-foreground">IIT Roorkee</p>
            </div>
            <a
              href="mailto:mansi1@me.iitr.ac.in"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground shrink-0"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-center">
        <p className="text-sm text-muted-foreground">
          Built with ❤️ for India ·{" "}
          <span className="font-semibold text-primary">Team Dual Core</span>
          {" "}· Microsoft AI Unlock Hackathon 2026
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">IIT Roorkee</p>
      </div>
    </div>
  );
}
