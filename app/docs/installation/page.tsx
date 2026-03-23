import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download,
  Wifi,
  AlertCircle,
  CheckCircle,
  Package,
  Code,
  Settings,
  Cpu,
  Droplet,
  CircuitBoard
} from "lucide-react";

export const metadata = {
  title: "Installation Guide - JalRakshak.AI Documentation",
  description: "Step-by-step installation guide for JalRakshak.AI water quality monitoring system. Setup hardware components, ESP32, water sensors, and software dependencies.",
};

export default function InstallationPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Download className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Installation & Device Setup</h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Complete guide for setting up and configuring your ESP32 LoRaWAN water quality monitoring devices.
        </p>
      </div>

      {/* Prerequisites */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Package className="h-6 w-6" />
            Prerequisites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  Arduino IDE
                </div>
                <div className="text-sm text-muted-foreground mb-2">For ESP32 development and code upload</div>
                <a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                  Download Arduino IDE →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg border border-border">
              <CheckCircle className="h-6 w-6 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-purple-500" />
                  TTN Account
                </div>
                <div className="text-sm text-muted-foreground mb-2">The Things Network for LoRaWAN backend</div>
                <a href="https://console.thethingsnetwork.org" target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                  Create TTN Account →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg border border-border">
              <Wifi className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-foreground mb-1">LoRaWAN Gateway</div>
                <div className="text-sm text-muted-foreground">Use public TTN gateways in your area or deploy your own</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Hardware Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground mb-2">ESP32 LoRaWAN Device:</div>
                <div className="space-y-1 ml-4">
                  <div>• ESP32 Development Board (30-pin)</div>
                  <div className="flex items-center gap-2">
                    <span>• Recommended:</span>
                    <a 
                      href="https://www.pandabyte.in/product-page/pandabyte-xlora-esp32-lora-microcontroller-board-arduino-compatible" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs"
                    >
                      PandaByte xLoRa ESP32 →
                    </a>
                  </div>
                  <div>• LoRaWAN Module (SX1276/SX1278 - 868/915 MHz)</div>
                  <div>• pH Sensor with analog probe</div>
                  <div>• TDS (Total Dissolved Solids) sensor</div>
                  <div>• DS18B20 waterproof temperature probe</div>
                  <div>• OLED Display (128×64 SSD1306, I²C)</div>
                </div>
              </div>
              <div>
                <div className="font-medium text-foreground mb-2">Additional Components:</div>
                <div className="space-y-1 ml-4">
                  <div>• USB Cable (Type-C or Micro-USB) for programming</div>
                  <div>• LiPo 3.7V battery + TP4056 charger (optional)</div>
                  <div>• 4.7 kΩ resistor (for DS18B20 pull-up)</div>
                  <div>• Jumper wires for connections</div>
                  <div>• Breadboard or PCB for assembly</div>
                  <div>• Waterproof enclosure (for outdoor deployment)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arduino IDE Setup */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Code className="h-6 w-6" />
            Arduino IDE Setup for ESP32
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">1. Add ESP32 Board Manager</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Open Arduino IDE → File → Preferences</p>
                <p>• In &quot;Additional Board Manager URLs&quot; add:</p>
              </div>
              <div className="bg-muted p-3 rounded-lg border border-border mt-2">
                <code className="text-emerald-500 text-sm font-mono break-all">
                  https://dl.espressif.com/dl/package_esp32_index.json
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">2. Install ESP32 Boards</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Go to Tools → Board → Boards Manager</p>
                <p>• Search for &quot;ESP32&quot; and install &quot;ESP32 by Espressif Systems&quot;</p>
                <p>• Wait for installation to complete</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">3. Install Required Libraries</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Go to Tools → Manage Libraries and install the following:</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-accent/50 p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">MCCI LoRaWAN LMIC</div>
                  <div className="text-sm text-muted-foreground">For LoRaWAN communication</div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mt-1">Required</Badge>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">OneWire</div>
                  <div className="text-sm text-muted-foreground">For DS18B20 temperature sensor</div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mt-1">Required</Badge>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">DallasTemperature</div>
                  <div className="text-sm text-muted-foreground">DS18B20 temperature library</div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mt-1">Required</Badge>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">Adafruit SSD1306</div>
                  <div className="text-sm text-muted-foreground">For OLED display</div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mt-1">Required</Badge>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">Adafruit GFX Library</div>
                  <div className="text-sm text-muted-foreground">Graphics library for display</div>
                  <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 mt-1">Required</Badge>
                </div>
                <div className="bg-accent/50 p-3 rounded-lg border border-border">
                  <div className="font-medium text-foreground">ArduinoJson</div>
                  <div className="text-sm text-muted-foreground">For JSON payload handling</div>
                  <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30 mt-1">Optional</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">4. Configure LMIC Library for Region</h3>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-500 mb-3">⚠️ Important: Region Configuration Required</h4>
                    <p className="text-sm text-amber-200/90 mb-3">
                      <strong>BEFORE uploading code,</strong> you must configure the LMIC library for your LoRaWAN frequency region.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">📍 For India Region (IN866):</p>
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                    <li>Navigate to: <code className="text-primary font-mono">My Documents &gt; Arduino &gt; libraries &gt; MCCI_LoRaWAN_LMIC_library &gt; project_config</code></li>
                    <li>Open <code className="text-primary font-mono">lmic_project_config.h</code> using Notepad or any text editor</li>
                    <li>Find the line: <code className="text-red-500 font-mono">#define CFG_us915 1</code></li>
                    <li>Comment it out by adding <code className="text-muted-foreground">{'//'}</code> at the beginning: <code className="text-muted-foreground font-mono">{'//'} #define CFG_us915 1</code></li>
                    <li>Find the line: <code className="text-muted-foreground font-mono">{'//'} #define CFG_in866 1</code></li>
                    <li>Uncomment it by removing <code className="text-muted-foreground">{'//'}</code>: <code className="text-emerald-500 font-mono">#define CFG_in866 1</code></li>
                    <li>Save and close the file</li>
                  </ol>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Other Regions:
                  </h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>• <strong className="text-foreground">Europe/India:</strong> Use <code className="text-emerald-500">CFG_eu868</code> or <code className="text-emerald-500">CFG_in866</code></div>
                    <div>• <strong className="text-foreground">United States:</strong> Use <code className="text-emerald-500">CFG_us915</code></div>
                    <div>• <strong className="text-foreground">Asia-Pacific:</strong> Use <code className="text-emerald-500">CFG_as923</code></div>
                    <div>• <strong className="text-foreground">Australia:</strong> Use <code className="text-emerald-500">CFG_au915</code></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Only ONE region should be enabled at a time. Make sure all other regions are commented out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board Configuration */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Board Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Before uploading code, configure Arduino IDE settings for your ESP32:
          </p>
          <div className="bg-muted p-4 rounded-lg border border-border space-y-3 text-sm font-mono">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Board:</span>
              <span className="text-foreground font-medium">ESP32 Dev Module</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Upload Speed:</span>
              <span className="text-foreground font-medium">921600</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">CPU Frequency:</span>
              <span className="text-foreground font-medium">240MHz (WiFi/BT)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Flash Size:</span>
              <span className="text-foreground font-medium">4MB (32Mb)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Partition Scheme:</span>
              <span className="text-foreground font-medium">Default 4MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Port:</span>
              <span className="text-foreground font-medium">COM3 (or your ESP32 port)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <section className="bg-gradient-to-r from-primary/10 to-cyan-500/10 p-8 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Installation Complete!</h3>
            <p className="text-muted-foreground">Your development environment is now ready.</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Next, review the circuit diagram to understand hardware connections, then use the code generator to create your custom Arduino sketch.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <a 
            href="/docs/circuit-diagram"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <CircuitBoard className="h-4 w-4" />
            View Circuit Diagram
          </a>
          <a 
            href="/docs/code-generator"
            className="inline-flex items-center gap-2 bg-card hover:bg-accent text-foreground border border-border px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            <Code className="h-4 w-4" />
            Generate Arduino Code
          </a>
        </div>
      </section>
    </div>
  );
}
