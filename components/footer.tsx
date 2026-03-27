import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-background/80">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Brand */}
          <BrandLogo className="gap-2" iconClassName="h-7 w-7 rounded-md" textClassName="text-sm font-semibold text-foreground" />

          {/* Tagline */}
          <p className="text-center text-xs text-muted-foreground">
            IoT-Powered Electricity Monitoring for Hostels, Institutions, and Hotels
          </p>

          {/* Links */}
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link
              href="/admin"
              className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              Admin
            </Link>
          </nav>
        </div>

        <Separator className="my-4 opacity-50" />

        <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>© 2026 VoltEdge — All Rights Reserved</p>
          <p>
            Designed &amp; Developed by{" "}
            <span className="font-semibold text-primary">VoltEdge Team</span>
            {" "}for smarter and efficient energy operations
          </p>
        </div>
      </div>
    </footer>
  );
}
