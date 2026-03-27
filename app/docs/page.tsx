import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, CircuitBoard, Code2, Settings } from "lucide-react";

const docs = [
  {
    title: "Circuit Diagram",
    href: "/docs/circuit-diagram",
    desc: "Placeholder section for electrical schematic and node wiring diagram.",
    icon: CircuitBoard,
  },
  {
    title: "Code Generator",
    href: "/docs/code-generator",
    desc: "Placeholder section for firmware and boilerplate generation flow.",
    icon: Code2,
  },
  {
    title: "Arduino Setup",
    href: "/docs/arduino-setup",
    desc: "Placeholder section for ESP32 board setup and upload guide.",
    icon: Settings,
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge className="border border-primary/30 bg-primary/10 text-primary">
          <BookOpen className="mr-1.5 h-3 w-3" />
          Documentation
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight">VoltEdge Docs</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Frontend documentation structure is ready. Technical content will be expanded in the next phase.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map(({ title, href, desc, icon: Icon }) => (
          <Card key={title} className="border-border/60">
            <CardHeader>
              <CardTitle className="inline-flex items-center gap-2 text-base">
                <Icon className="h-4 w-4 text-primary" />
                {title}
              </CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                Open section
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
