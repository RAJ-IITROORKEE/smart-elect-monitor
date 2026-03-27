import { Code2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CodeGeneratorDocPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Code2 className="h-7 w-7 text-primary" />
          Code Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          This section will host the firmware/code generation workflow for ESP32 nodes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
            Code generator content will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
