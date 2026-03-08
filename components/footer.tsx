import Link from "next/link";
import { Droplets } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-background/80">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
              <Droplets className="h-4 w-4 text-primary" />
            </span>
            <span className="text-sm font-semibold text-foreground">JalRakshak.AI</span>
          </div>

          {/* Tagline */}
          <p className="text-center text-xs text-muted-foreground">
            IoT-Powered Water Quality Intelligence — Protecting India&apos;s Water, One Sensor at a Time
          </p>

          {/* Links */}
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>

        <Separator className="my-4 opacity-50" />

        <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© 2026 JalRakshak.AI — All Rights Reserved</p>
          <p>
            Designed &amp; Developed by{" "}
            <span className="font-semibold text-primary">DualCode Team</span>
            {" "}for{" "}
            <span className="font-medium text-foreground">Microsoft AI Unlock Hackathon</span>
            {" "}· AI for India Track
          </p>
        </div>
      </div>
    </footer>
  );
}
