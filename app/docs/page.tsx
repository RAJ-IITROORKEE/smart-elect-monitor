import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Code2, Webhook, Cpu, Database, Terminal,
  Radio, Globe, Settings, Key, MapPin,
  AlertCircle, CheckCircle, Info, Zap,
} from "lucide-react";
import { ArduinoCodeGen } from "@/components/arduino-code-gen";

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
          Integration guide for the JalRakshak.AI platform — hardware wiring, TTN setup,
          Arduino code generator, and API reference.
        </p>
      </div>

      {/* ── Table of Contents ─────────────────────────────────── */}
      <nav className="mb-10 rounded-xl border border-border/60 bg-card p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Contents</p>
        <ol className="space-y-1.5 text-sm text-primary list-decimal list-inside">
          <li><a href="#ttn-account" className="hover:underline">TTN Account &amp; Application</a></li>
          <li><a href="#ttn-device" className="hover:underline">Register End Device</a></li>
          <li><a href="#ttn-webhook" className="hover:underline">Webhook Configuration</a></li>
          <li><a href="#ttn-decoder" className="hover:underline">TTN Uplink Decoder</a></li>
          <li><a href="#arduino-code" className="hover:underline">Arduino Code Generator</a></li>
          <li><a href="#hardware" className="hover:underline">Hardware &amp; Pin Connections</a></li>
          <li><a href="#api" className="hover:underline">Internal API Reference</a></li>
          <li><a href="#ai-model" className="hover:underline">AI Prediction Model</a></li>
        </ol>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          1. TTN Account & Application
      ══════════════════════════════════════════════════════════ */}
      <section id="ttn-account" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">1. TTN Account &amp; Application</h2>
        </div>

        <div className="space-y-6">
          {/* Create account */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
                Create a TTN Account
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Visit <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">console.thethingsnetwork.org</span> and sign up for a free account.</p>
              <p>Choose the cluster closest to your deployment region:</p>
              <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                <div>🌏 Asia Pacific: <span className="text-primary">au1.cloud.thethings.network</span></div>
                <div>🇮🇳 India (IN865): use <span className="text-primary">eu1</span> cluster — select <strong>India 865–867 MHz</strong> frequency plan</div>
                <div>🌍 Europe: <span className="text-primary">eu1.cloud.thethings.network</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Create application */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">2</span>
                Create an Application
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>In the TTN Console, click <strong className="text-foreground">Applications → + Create application</strong>.</p>
              <div className="rounded-lg border border-border/60 bg-muted p-3 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application ID</span>
                  <span className="text-foreground">jalrakshak-ai</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground">JalRakshak Water Monitor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="text-foreground">LoRaWAN water quality sensors</span>
                </div>
              </div>
              <p className="text-xs">After creation, note the <strong className="text-foreground">Application ID</strong> — you will need it when configuring the webhook URL.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* ══════════════════════════════════════════════════════════
          2. Register End Device
      ══════════════════════════════════════════════════════════ */}
      <section id="ttn-device" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">2. Register End Device</h2>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-xs text-muted-foreground">
            This guide uses <strong className="text-foreground">OTAA (Over-The-Air Activation)</strong> — the recommended and more secure join method.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Register end device",
              body: <>In your application, click <strong className="text-foreground">+ Register end device</strong> → <strong className="text-foreground">Enter end device specifics manually</strong>.</>,
            },
            {
              step: 2,
              title: "Frequency plan",
              body: (
                <div className="rounded-lg bg-muted p-3 font-mono text-xs flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">India 865–867 MHz (FSK)</span>
                </div>
              ),
            },
            {
              step: 3,
              title: "LoRaWAN version",
              body: (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="rounded-lg bg-muted p-2">
                    <div className="text-muted-foreground mb-1">Version</div>
                    <div className="text-foreground">MAC V1.0.2</div>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <div className="text-muted-foreground mb-1">Regional Parameters</div>
                    <div className="text-foreground">RP001 1.0.2 rev B</div>
                  </div>
                </div>
              ),
            },
            {
              step: 4,
              title: "JoinEUI / AppEUI — set to all zeros",
              body: (
                <div className="rounded-lg bg-muted p-3 font-mono text-xs flex items-center justify-between">
                  <span className="text-foreground">0000000000000000</span>
                  <Badge variant="outline" className="text-[10px]">All zeros</Badge>
                </div>
              ),
            },
            {
              step: 5,
              title: "Generate DevEUI and AppKey",
              body: (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Click <strong className="text-foreground">Generate</strong> for both DevEUI and AppKey — or enter your own. Copy them; you will paste them into the code generator below.</p>
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                    <span className="text-amber-300">DevEUI must be copied in <strong>LSB</strong> format. AppKey in <strong>MSB</strong> format. Use the ↕ toggle in the TTN Console.</span>
                  </div>
                </div>
              ),
            },
            {
              step: 6,
              title: "Set a Device ID",
              body: (
                <div className="space-y-2">
                  <div className="rounded-lg bg-muted p-3 font-mono text-xs text-foreground">
                    jalrakshak-node-01
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This ID becomes the <code className="text-primary">deviceId</code> stored in MongoDB and displayed in the dashboard. Use a descriptive, location-based name.
                  </p>
                </div>
              ),
            },
            {
              step: 7,
              title: `Click "Register end device"`,
              body: (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Device registered. Copy the DevEUI and AppKey from the device overview page.
                </div>
              ),
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                {step}
              </span>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <div>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* ══════════════════════════════════════════════════════════
          3. Webhook Configuration
      ══════════════════════════════════════════════════════════ */}
      <section id="ttn-webhook" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Webhook className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">3. Webhook Configuration</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          The TTN webhook pushes every uplink from your sensor nodes to the JalRakshak backend where it is decoded, stored in MongoDB, and surfaced on the dashboard.
        </p>

        <div className="space-y-4">
          {/* Step-by-step */}
          {[
            {
              n: 1,
              title: "Open Webhooks",
              body: "In your TTN application go to Integrations → Webhooks → + Add webhook → Custom webhook.",
            },
            {
              n: 2,
              title: "Webhook ID",
              body: <span className="font-mono text-xs bg-muted text-foreground px-1.5 py-0.5 rounded">jalrakshak-uplink</span>,
            },
            {
              n: 3,
              title: "Base URL",
              body: (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Production (after Vercel deploy):</p>
                    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                      POST https://jalrakshak-ai-dualcore.vercel.app/api/webhook
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Local dev — use the SmartPark relay as a bridge:</p>
                    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono text-foreground">
                      POST https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
                    </pre>
                  </div>
                </div>
              ),
            },
            {
              n: 4,
              title: "Enable Uplink message events",
              body: (
                <p className="text-xs text-muted-foreground">
                  Under <strong className="text-foreground">Enabled messages</strong>, tick <strong className="text-foreground">Uplink message</strong> only.
                </p>
              ),
            },
            {
              n: 5,
              title: "Optional — secure with a shared secret",
              body: (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Add a custom header in TTN:</p>
                  <div className="rounded-lg bg-muted p-3 font-mono text-foreground">
                    <div>Header: <span className="text-primary">X-TTN-Secret</span></div>
                    <div>Value: <span className="text-primary">your_secret_value</span></div>
                  </div>
                  <p>Then set the same value in your Vercel env:</p>
                  <div className="rounded-lg bg-muted p-3 font-mono text-foreground">TTN_WEBHOOK_SECRET=your_secret_value</div>
                  <p>Leave both unset for open access (fine for hackathon / dev).</p>
                </div>
              ),
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">{n}</span>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <div className="text-sm text-muted-foreground">{body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* ══════════════════════════════════════════════════════════
          4. TTN Uplink Decoder
      ══════════════════════════════════════════════════════════ */}
      <section id="ttn-decoder" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">4. TTN Uplink Decoder</h2>
        </div>
        <p className="mb-4 text-muted-foreground text-sm leading-relaxed">
          Add this JavaScript formatter in the TTN Console under{" "}
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            Payload Formatters → Uplink → Custom Javascript formatter
          </span>
        </p>
        <Card className="overflow-hidden border-border/60">
          <CardContent className="p-0">
            <pre className="overflow-x-auto bg-zinc-950 p-5 text-sm text-zinc-100 font-mono leading-relaxed">
{`function decodeUplink(input) {
  // Byte layout (6 bytes total):
  //  [0-1]  temperature  ÷ 10  → °C     e.g. 0x00, 0xFD → 25.3 °C
  //  [2-3]  TDS          ×  1  → ppm    e.g. 0x01, 0x38 → 312 ppm
  //  [4-5]  pH           ÷ 100 → 0–14   e.g. 0x02, 0xD1 → 7.21

  var temp = (input.bytes[0] << 8 | input.bytes[1]) / 10;
  var tds  = (input.bytes[2] << 8 | input.bytes[3]);
  var ph   = (input.bytes[4] << 8 | input.bytes[5]) / 100;

  return {
    data: {
      temperature: temp,
      tds:         tds,
      ph:          ph
    }
  };
}`}
            </pre>
          </CardContent>
        </Card>
        <p className="mt-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Turbidity</strong> is generated server-side as a random 1–10 NTU value until the hardware probe is wired.{" "}
          <strong className="text-foreground">Conductivity</strong> is derived as TDS × 2 μS/cm.
        </p>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* ══════════════════════════════════════════════════════════
          5. Arduino Code Generator
      ══════════════════════════════════════════════════════════ */}
      <section id="arduino-code" className="mb-12">
        <div className="mb-2 flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">5. Arduino Code Generator</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Paste your TTN credentials. The full{" "}
          <code className="text-primary text-xs">TDS_TEMP_PH_OLED_TTN.ino</code>{" "}
          sketch will update live — copy or download it and flash to your ESP32.
        </p>

        {/* Required libraries note */}
        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wide">Required Arduino Libraries</p>
          <div className="grid grid-cols-2 gap-1 text-xs font-mono text-muted-foreground sm:grid-cols-3">
            {[
              "MCCI LoRaWAN LMIC",
              "OneWire",
              "DallasTemperature",
              "Adafruit SSD1306",
              "Adafruit GFX Library",
              "ESP32 board package",
            ].map((lib) => (
              <div key={lib} className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                {lib}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Install all via <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">Arduino IDE → Library Manager</span> or PlatformIO.
          </p>
        </div>

        <ArduinoCodeGen />
      </section>

      <Separator className="my-8 opacity-40" />

      {/* ══════════════════════════════════════════════════════════
          6. Hardware & Pin Connections
      ══════════════════════════════════════════════════════════ */}
      <section id="hardware" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">6. Hardware &amp; Pin Connections</h2>
        </div>

        {/* Components */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2 text-sm">
          {[
            { component: "Microcontroller",  detail: "ESP32 (30-pin dev board)" },
            { component: "LoRa Radio",        detail: "SX1276 / Ra-02 — 868 MHz" },
            { component: "pH Sensor",         detail: "Analog pH probe + BNC module" },
            { component: "TDS Sensor",        detail: "Gravity TDS sensor module" },
            { component: "Temperature",       detail: "DS18B20 waterproof probe (1-Wire)" },
            { component: "Display",           detail: "OLED 128×64 SSD1306 (I²C)" },
            { component: "Power",             detail: "LiPo 3.7 V + TP4056 charger" },
            { component: "TX Interval",       detail: "60 seconds (battery friendly)" },
          ].map(({ component, detail }) => (
            <div key={component} className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3">
              <span className="text-muted-foreground text-xs">{component}</span>
              <span className="font-medium text-foreground text-xs">{detail}</span>
            </div>
          ))}
        </div>

        {/* Pin table — LoRa */}
        <Card className="border-border/60 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              LoRa SX1276 → ESP32
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="pb-2 text-left font-semibold text-muted-foreground">SX1276 Pin</th>
                  <th className="pb-2 text-left font-semibold text-muted-foreground">ESP32 GPIO</th>
                  <th className="pb-2 text-left font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {[
                  ["NSS  (CS)",  "GPIO 5",  "SPI chip select"],
                  ["RST",        "GPIO 26", "LoRa reset"],
                  ["DIO0",       "GPIO 25", "TX done / RX done IRQ"],
                  ["DIO1",       "GPIO 33", "RX timeout IRQ"],
                  ["DIO2",       "GPIO 32", "FHSS IRQ"],
                  ["MOSI",       "GPIO 23", "SPI default MOSI"],
                  ["MISO",       "GPIO 19", "SPI default MISO"],
                  ["SCK",        "GPIO 18", "SPI default clock"],
                  ["3.3 V",      "3V3",     "Power"],
                  ["GND",        "GND",     "Ground"],
                ].map(([pin, gpio, note]) => (
                  <tr key={pin}>
                    <td className="py-1.5 text-primary">{pin}</td>
                    <td className="py-1.5 text-foreground">{gpio}</td>
                    <td className="py-1.5 text-muted-foreground">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Pin table — Sensors */}
        <Card className="border-border/60 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Sensor Pins → ESP32
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="pb-2 text-left font-semibold text-muted-foreground">Sensor</th>
                  <th className="pb-2 text-left font-semibold text-muted-foreground">ESP32 GPIO</th>
                  <th className="pb-2 text-left font-semibold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {[
                  ["TDS (analog out)",    "GPIO 2",       "12-bit ADC, VREF = 3.3 V"],
                  ["pH (analog out)",     "GPIO 34",      "Input-only ADC pin"],
                  ["DS18B20 (data)",      "GPIO 14",      "1-Wire; add 4.7 kΩ pull-up to 3.3 V"],
                  ["OLED SDA",            "GPIO 21",      "I²C data (Wire default)"],
                  ["OLED SCL",            "GPIO 22",      "I²C clock (Wire default)"],
                ].map(([sensor, gpio, note]) => (
                  <tr key={sensor}>
                    <td className="py-1.5 text-primary">{sensor}</td>
                    <td className="py-1.5 text-foreground">{gpio}</td>
                    <td className="py-1.5 text-muted-foreground">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Calibration note */}
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="font-semibold text-foreground mb-1">Calibration values (adjust in code)</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><code className="text-primary">baseline = 1.83</code> — TDS voltage offset. Measure distilled water and adjust.</li>
              <li><code className="text-primary">calibrationOffset = 13.50</code> — pH probe intercept. Use a pH 7 buffer solution to calibrate.</li>
            </ul>
          </div>
        </div>
      </section>

      <Separator className="my-8 opacity-40" />

      {/* ══════════════════════════════════════════════════════════
          7. Internal API Reference
      ══════════════════════════════════════════════════════════ */}
      <section id="api" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">7. Internal API Reference</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              method: "POST",
              path: "/api/webhook",
              params: "",
              desc: "TTN uplink receiver. Decodes payload (or raw Base64 bytes) and upserts Reading + Device documents in MongoDB. Optionally validated via X-TTN-Secret header.",
            },
            {
              method: "GET",
              path: "/api/sensor-data",
              params: "?limit=N",
              desc: "Returns sensor readings (max 500). Priority: MongoDB → SmartPark relay → empty. Response includes source, count, totalReadings, lastDataAt.",
            },
            {
              method: "POST",
              path: "/api/predict",
              params: "",
              desc: "Body: { ph, tds, conductivity, turbidity }. Calls Python FastAPI (FASTAPI_URL) with 8-second timeout; falls back to the TypeScript engine. Returns WaterPrediction + engine field.",
            },
            {
              method: "GET",
              path: "/api/db-test",
              params: "",
              desc: "Returns { db, devices, readings } — quick MongoDB connectivity check. Remove or protect before production.",
            },
          ].map(({ method, path, params, desc }) => (
            <div key={path} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 font-mono text-sm">
                <Badge
                  className={`text-[10px] font-mono ${method === "GET" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" : "bg-primary/15 text-primary border-primary/30"} border`}
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

      {/* ══════════════════════════════════════════════════════════
          8. AI Prediction Model
      ══════════════════════════════════════════════════════════ */}
      <section id="ai-model" className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">8. AI Prediction Model</h2>
        </div>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            The prediction engine is a{" "}
            <strong className="text-foreground">Random Forest Classifier</strong> (200 estimators)
            trained on the Kaggle Water Potability dataset (3,276 samples, <code className="text-primary">water_potability.csv</code>).
          </p>
          <p>
            The TypeScript fallback in <code className="text-primary">lib/predict.ts</code> mirrors the Python FastAPI logic exactly — safety scoring, cause detection, recommendation generation, and a 5-reading ring-buffer for future risk trend analysis.
          </p>
          <div className="rounded-lg border border-border/60 bg-card p-4 mt-3">
            <p className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wide">Safety Score Deductions (max 100)</p>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-border/40">
                {[
                  ["Turbidity > 5 NTU",        "−30 pts"],
                  ["TDS > 500 ppm",             "−25 pts"],
                  ["pH < 6.5 or pH > 8.5",      "−20 pts"],
                  ["Conductivity > 600 μS/cm",  "−15 pts"],
                ].map(([cond, pts]) => (
                  <tr key={cond}>
                    <td className="py-1.5 text-muted-foreground">{cond}</td>
                    <td className="py-1.5 text-right font-mono text-red-400">{pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-center">
              {[
                ["≥ 80", "Low risk", "text-emerald-400"],
                ["50–79", "Moderate", "text-amber-400"],
                ["< 50", "High risk", "text-red-400"],
              ].map(([score, label, cls]) => (
                <div key={score} className="rounded-lg border border-border/40 bg-muted p-2">
                  <div className={`font-bold ${cls}`}>{score}</div>
                  <div className="text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
