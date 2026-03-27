import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Contact Requests</h2>
        <p className="text-sm text-muted-foreground">Admin-side inquiry handling panel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Management</CardTitle>
          <CardDescription>
            Queue, status updates, and response actions for inbound requests.
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
