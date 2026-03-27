"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircuitBoard,
  Code2,
  Menu,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";

interface DocsLayoutProps {
  children: React.ReactNode;
}

const docItems = [
  { title: "Overview", href: "/docs", icon: BookOpen, description: "Project documentation landing" },
  { title: "Circuit Diagram", href: "/docs/circuit-diagram", icon: CircuitBoard, description: "Hardware schematic placeholder" },
  { title: "Code Generator", href: "/docs/code-generator", icon: Code2, description: "Firmware generator placeholder" },
  { title: "Arduino Setup", href: "/docs/arduino-setup", icon: Settings, description: "Board setup placeholder" },
];

export default function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentIndex = docItems.findIndex((item) => item.href === pathname);
  const prevPage = currentIndex > 0 ? docItems[currentIndex - 1] : null;
  const nextPage = currentIndex < docItems.length - 1 ? docItems[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo textClassName="gradient-text" />
          </Link>
          <div className="ml-auto hidden items-center gap-5 text-sm md:flex">
            <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
            <Link href="/admin" className="rounded-md border border-primary/30 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">Admin</Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="fixed top-20 left-4 z-40 lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen((v) => !v)}>
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <aside
          className={cn(
            "fixed top-14 left-0 bottom-0 z-30 w-80 border-r border-border bg-card transition-transform lg:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-6 py-6">
              <h2 className="text-xl font-bold">Documentation</h2>
              <p className="mt-2 text-sm text-muted-foreground">Smart Electricity Monitor docs structure</p>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
              {docItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "block rounded-lg border px-3 py-3 transition-colors",
                      isActive
                        ? "border-primary/30 bg-primary/10"
                        : "border-transparent hover:border-border hover:bg-accent/50"
                    )}
                  >
                    <p className="inline-flex items-center gap-2 text-sm font-medium">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {isSidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-background/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close docs sidebar"
          />
        ) : null}

        <main className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-y-auto lg:ml-80">
          <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
            {children}

            <div className="mt-16 flex items-center justify-between border-t border-border pt-8">
              <div>
                {prevPage ? (
                  <Link href={prevPage.href} className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80">
                    <ArrowLeft className="h-4 w-4" />
                    {prevPage.title}
                  </Link>
                ) : null}
              </div>
              <div>
                {nextPage ? (
                  <Link href={nextPage.href} className="inline-flex items-center gap-2 text-sm text-primary transition-colors hover:text-primary/80">
                    {nextPage.title}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
