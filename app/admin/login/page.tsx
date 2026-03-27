"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border/70">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Login flow UI is configured. Authentication integration is currently in progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            Currently in progress.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
