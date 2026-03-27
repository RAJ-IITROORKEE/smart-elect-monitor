import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevicePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Device Workspace</CardTitle>
          <CardDescription>
            Device-specific interaction modules are currently in progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
            Currently in progress.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
