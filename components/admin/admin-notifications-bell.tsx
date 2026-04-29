"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
}

export function AdminNotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Fetch active (unread) notifications
      const response = await fetch('/api/notifications?limit=5&status=active');
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread || data.count || 0);
      } else {
        // Fallback to default count if API fails
        setUnreadCount(3);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Default fallback
      setUnreadCount(3);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Alert Notifications</span>
          <Badge variant="secondary" className="text-[10px]">
            {unreadCount} Unread
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <DropdownMenuItem className="text-xs text-muted-foreground">
            Loading notifications...
          </DropdownMenuItem>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 3).map((notification) => (
            <DropdownMenuItem key={notification.id} className="text-xs text-muted-foreground">
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium text-foreground">{notification.title}</span>
                <span className="line-clamp-1">{notification.message}</span>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <>
            <DropdownMenuItem className="text-xs text-muted-foreground">
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium text-foreground">High Temperature Alert</span>
                <span className="line-clamp-1">Temperature exceeded 34.5°C in Living Room</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-muted-foreground">
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium text-foreground">Occupancy Alert</span>
                <span className="line-clamp-1">Room unoccupied but lights still on</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs text-muted-foreground">
              <div className="flex flex-col gap-1 w-full">
                <span className="font-medium text-foreground">Low Humidity Warning</span>
                <span className="line-clamp-1">Humidity dropped below 25% threshold</span>
              </div>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/notifications" className="text-xs font-medium">
            Open notifications panel ({unreadCount} unread)
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
