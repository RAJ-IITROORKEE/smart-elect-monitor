"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Bell,
  Bolt,
  BookOpen,
  LayoutDashboard,
  LogOut,
  MailQuestion,
  Radio,
  Settings,
  Server,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Energy Nodes",
    href: "/admin/dashboard",
    icon: Server,
  },
  {
    title: "Live Analysis",
    href: "/admin/live-data",
    icon: Radio,
  },
  {
    title: "Contacts",
    href: "/admin/contacts",
    icon: MailQuestion,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Docs",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/admin/dashboard",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/60 transition-colors">
                <Link href="/admin/dashboard">
                  <BrandLogo
                    className="gap-2"
                    iconClassName="size-8 rounded-lg shadow-sm shadow-primary/25"
                    textClassName="truncate text-sm font-semibold"
                  />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-2 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-9 gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                        // Hover state
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        // Active state
                        isActive
                          ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary hover:bg-primary/15 hover:text-primary"
                          : "text-sidebar-foreground/70"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        {/* Active left bar indicator */}
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-primary transition-all duration-200",
                              isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                            )}
                          />
                        <item.icon
                            className={cn(
                              "size-4 shrink-0 transition-colors duration-150",
                              isActive
                                ? "text-primary"
                                : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                            )}
                          />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <div className="space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="h-9 gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/50 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Link href="/" className="flex items-center gap-3">
                  <ArrowLeft className="size-4 shrink-0" />
                  <span>Back to Website</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <Button
            type="button"
            variant="ghost"
            className="h-9 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
            disabled
          >
            <LogOut className="size-4 shrink-0" />
            Logout (in progress)
          </Button>
          <p className="px-3 pb-2 text-[11px] text-sidebar-foreground/55">
            <Bolt className="mr-1 inline-block size-3" />
            Smart Electricity Monitor Admin
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
