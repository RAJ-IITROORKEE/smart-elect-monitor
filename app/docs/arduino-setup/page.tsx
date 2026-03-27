import { Settings } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ArduinoSetupDocPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings className="h-7 w-7 text-primary" />
          Arduino Setup
        </h1>
        <p className="text-sm text-muted-foreground">
          This section will contain the ESP32 Arduino IDE setup and deployment guide.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            Arduino setup content will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
