import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiveDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Live Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Realtime telemetry and analysis stream placeholder
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Realtime Stream</CardTitle>
          <CardDescription>
            Device-wise consumption logs, timeline analysis, and live event feed.
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
