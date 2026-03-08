import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Github, Globe, MessageCircle, Award } from "lucide-react";

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
          JalRakshak.AI is a hackathon project by the DualCode Team, built for the
          Microsoft AI Unlock Hackathon — AI for India Track. We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: Award,
            title: "Hackathon Project",
            desc: "Microsoft AI Unlock Hackathon",
            sub: "AI for India Track · 2026",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            icon: Globe,
            title: "Live Dashboard",
            desc: "hydro-monitor-app.vercel.app",
            sub: "Real-time water monitoring",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: Globe,
            title: "TTN Relay API",
            desc: "iot-smart-park.vercel.app",
            sub: "/api/ttn/jalrakshak-ai",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Github,
            title: "Source Code",
            desc: "github.com/DualCodeTeam",
            sub: "JalRakshak-AI repository",
            color: "text-foreground",
            bg: "bg-muted",
          },
        ].map(({ icon: Icon, title, desc, sub, color, bg }) => (
          <Card key={title} className="border-border/60">
            <CardContent className="flex gap-4 p-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{title}</p>
                <p className="text-sm font-semibold text-foreground">{desc}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Reach Out</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          For collaboration, deployment inquiries, or feedback about JalRakshak.AI,
          feel free to open an issue on our GitHub repository or reach us through
          the Microsoft AI Unlock Hackathon channels.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Built with ❤️ for India ·{" "}
          <span className="font-semibold text-primary">DualCode Team</span>
          {" "}· Microsoft AI Unlock Hackathon 2026
        </p>
      </div>
    </div>
  );
}
