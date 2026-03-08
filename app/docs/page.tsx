import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code2, Webhook, Cpu, Database, Terminal } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <Badge className="mb-3 bg-primary/10 text-primary border border-primary/30">
          <Code2 className="mr-1.5 h-3 w-3" />
          Developer Documentation
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Technical <span className="gradient-text">Docs</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Integration guide for the JalRakshak.AI platform.
        </p>
      </div>

      {/* Table of Contents */}
      <nav className="mb-10 rounded-xl border border-border/60 bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Contents</p>
        <ul className="space-y-1.5 text-sm text-primary">
          <li><a href="#ttn-decoder" className="hover:underline">1. TTN Uplink Decoder</a></li>
          <li><a href="#webhook" className="hover:underline">2. Webhook Setup</a></li>
          <li><a href="#api" className="hover:underline">3. Internal API Reference</a></li>
          <li><a href="#ai-model" className="hover:underline">4. AI Prediction Model</a></li>
          <li><a href="#hardware" className="hover:underline">5. Hardware Setup</a></li>
        </ul>
      </nav>

      {/* TTN Decoder */}
      <section id="ttn-decoder" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">1. TTN Uplink Decoder</h2>
        </div>
        <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
          Configure this decoder in your TTN application under{" "}
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            Payload Formatters → Uplink → Custom Javascript formatter
          </span>
        </p>
        <Card className="overflow-hidden border-border/60">
          <CardContent className="p-0">
            <pre className="overflow-x-auto bg-zinc-950 p-5 text-sm text-zinc-100 font-mono leading-relaxed">
{`function decodeUplink(input) {
  var temp = (input.bytes[0] << 8 | input.bytes[1]) / 10;
  var tds  = (input.bytes[2] << 8 | input.bytes[3]);
  var ph   = (input.bytes[4] << 8 | input.bytes[5]) / 100;

  return {
    data: {
      temperature: temp,   // °C  e.g. 25.3
      tds: tds,            // ppm e.g. 312
      ph: ph               // 0-14 e.g. 7.21
    }
  };
}`}
            </pre>
          </CardContent>
        </Card>
        <p className="mt-3 text-xs text-muted-foreground">
          Turbidity is generated as a random value (1–10 NTU) server-side since the current
          hardware payload does not include it. Conductivity is estimated as TDS × 2 μS/cm.
        </p>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* Webhook */}
      <section id="webhook" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">2. Webhook Setup</h2>
        </div>
        <p className="mb-4 text-muted-foreground text-sm">
          Two endpoints are available depending on your deployment stage:
        </p>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="success" className="text-[10px]">Live Relay</Badge>
                SmartPark Relay (for localhost dev)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>While developing locally, point your TTN webhook to:</p>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                POST https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
              </pre>
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                GET  https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai?limit=20
              </pre>
              <p className="text-xs">
                The hydro-monitor-app polls this relay via <code className="text-primary">/api/sensor-data</code> when 
                its local store is empty.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">Production</Badge>
                Direct Webhook (after deployment)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                POST https://&lt;your-domain&gt;/api/webhook
              </pre>
              <p className="text-xs">
                Optionally set <code className="text-primary">TTN_WEBHOOK_SECRET</code> env var
                and add the header <code className="text-primary">X-TTN-Secret: &lt;value&gt;</code>
                in your TTN webhook settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* API */}
      <section id="api" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">3. Internal API Reference</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              method: "GET",
              path: "/api/sensor-data",
              params: "?limit=20",
              desc: "Returns latest sensor readings. Falls back to SmartPark relay if local store is empty.",
            },
            {
              method: "POST",
              path: "/api/predict",
              params: "",
              desc: 'Body: { ph, tds, conductivity, turbidity }. Returns full WaterPrediction object.',
            },
            {
              method: "POST",
              path: "/api/webhook",
              params: "",
              desc: "TTN uplink receiver. Decodes & stores sensor reading in memory.",
            },
          ].map(({ method, path, params, desc }) => (
            <div key={path} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 font-mono text-sm">
                <Badge
                  variant={method === "GET" ? "success" : "default"}
                  className="text-[10px] font-mono"
                >
                  {method}
                </Badge>
                <span className="text-foreground">{path}</span>
                {params && <span className="text-muted-foreground">{params}</span>}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* AI Model */}
      <section id="ai-model" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">4. AI Prediction Model</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>The prediction engine is a <strong className="text-foreground">Random Forest Classifier</strong> 
          (200 estimators) trained on the Kaggle Water Potability dataset (3,276 samples).</p>
          <p>The TypeScript implementation in <code className="text-primary">lib/predict.ts</code> mirrors 
          the Python FastAPI logic exactly, including safety scoring, cause detection, 
          recommendation generation, and future risk trend analysis.</p>
          <div className="rounded-lg border border-border/60 bg-card p-4 mt-3">
            <p className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wide">Safety Score Deductions</p>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border/40">
                {[
                  ["Turbidity > 5 NTU", "−30 pts"],
                  ["TDS > 500 ppm", "−25 pts"],
                  ["pH < 6.5 or pH > 8.5", "−20 pts"],
                  ["Conductivity > 600 μS/cm", "−15 pts"],
                ].map(([cond, pts]) => (
                  <tr key={cond}>
                    <td className="py-1.5 text-muted-foreground">{cond}</td>
                    <td className="py-1.5 text-right font-mono text-red-400">{pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* Hardware */}
      <section id="hardware">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">5. Hardware Setup</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { component: "Microcontroller", detail: "ESP32 (30-pin)" },
            { component: "LoRa Radio", detail: "SX1276 / Ra-02 868 MHz" },
            { component: "pH Sensor", detail: "Analog pH probe + BNC connector" },
            { component: "TDS Sensor", detail: "Gravity TDS sensor module" },
            { component: "Temperature", detail: "DS18B20 waterproof probe" },
            { component: "Power", detail: "LiPo 3.7V + TP4056 charger" },
          ].map(({ component, detail }) => (
            <div key={component} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3">
              <span className="text-muted-foreground text-xs">{component}</span>
              <span className="font-medium text-foreground text-xs">{detail}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
