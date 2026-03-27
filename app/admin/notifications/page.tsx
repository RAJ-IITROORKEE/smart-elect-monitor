import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-sm text-muted-foreground">Critical alerts and warning center</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Queue</CardTitle>
          <CardDescription>
            Rule-based alerts, anomaly notifications, and acknowledgement workflow.
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
