"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  CircuitBoard,
  Radio,
  Zap,
  Info,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  Droplet,
  CheckCircle,
  Maximize2,
  Download,
  X,
} from "lucide-react";

export default function CircuitDiagramPage() {
  const [zoom, setZoom] = useState(100);
  const [flowZoom, setFlowZoom] = useState(100);
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [flowDialogZoom, setFlowDialogZoom] = useState(100);
  const [flowchartLoadError, setFlowchartLoadError] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const handleFlowZoomIn = () => setFlowZoom((prev) => Math.min(prev + 15, 250));
  const handleFlowZoomOut = () => setFlowZoom((prev) => Math.max(prev - 15, 50));
  const handleFlowZoomReset = () => setFlowZoom(100);

  const handleOpenFlowPreview = () => {
    setFlowDialogZoom(100);
    setFlowDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <CircuitBoard className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Circuit Diagram & System Architecture</h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Hardware wiring diagrams, pin connections, and system flowchart for JalRakshak.AI water monitoring nodes.
        </p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
            <CircuitBoard className="h-5 w-5" />
            Recommended ESP32 Board
          </h3>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              This project is designed to work with standard ESP32 development boards with external LoRa modules.
            </p>
            <p className="mb-2">
              <strong className="text-foreground">Recommended Board:</strong> PandaByte xLoRa ESP32 LoRaWAN Development Board (ESP32-WROOM-32E with integrated RA-01H LoRa module)
            </p>
            <a 
              href="https://www.pandabyte.in/product-page/pandabyte-xlora-esp32-lora-microcontroller-board-arduino-compatible" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
            >
              Purchase PandaByte xLoRa Board (₹3,000) →
            </a>
            <p className="text-xs mt-2 text-muted-foreground">
              Note: If using the PandaByte xLoRa board, the LoRa module is already integrated. The pin connections below are for reference with external SX1276 modules on standard ESP32 boards.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">ESP32</Badge>
          <Badge className="bg-purple-500/15 text-purple-500 border border-purple-500/30">LoRa SX1276</Badge>
          <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">Water Sensors</Badge>
          <Badge className="bg-orange-500/15 text-orange-500 border border-orange-500/30">OLED Display</Badge>
        </div>
      </div>

      {/* Circuit Diagram Viewer - Placeholder */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <ImageIcon className="h-6 w-6" />
              Complete Circuit Diagram
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Badge variant="outline">{zoom}%</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Placeholder for circuit diagram */}
          <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-12 text-center overflow-auto">
            <div 
              className="flex flex-col items-center justify-center min-h-[400px] transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <CircuitBoard className="h-24 w-24 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">Circuit Diagram Placeholder</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                This is a placeholder for the complete circuit diagram showing all connections 
                between ESP32, LoRa module, sensors, and display.
              </p>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Image will be added by the user
              </p>
            </div>
          </div>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-500 mb-1">Circuit Diagram Image</h4>
                <p className="text-sm text-amber-200/90">
                  Add your circuit diagram image (PNG/JPG) to <code className="font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">/public/circuit-diagram.png</code> 
                  and it will be displayed here with zoom controls.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Flowchart */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl text-primary flex items-center gap-2">
              <Droplet className="h-6 w-6" />
              System Flowchart
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              {/* Zoom Controls Group */}
              <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleFlowZoomOut}
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleFlowZoomReset}
                  title="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleFlowZoomIn}
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Badge variant="secondary" className="ml-1 font-mono text-xs">
                  {flowZoom}%
                </Badge>
              </div>
              
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleOpenFlowPreview}
                disabled={flowchartLoadError}
              >
                <Maximize2 className="mr-1.5 h-4 w-4" />
                Preview Full
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Flowchart Container */}
          <div className="overflow-auto rounded-xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-4 max-h-[600px]">
            {flowchartLoadError ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <Zap className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground">Flowchart image not found</h3>
                <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                  Place the file at <code className="rounded bg-muted px-1.5 py-0.5">/public/flowchart_jalrakshak_ai.svg</code> and refresh this page.
                </p>
              </div>
            ) : (
              <div 
                className="transition-all duration-200 ease-out"
                style={{ 
                  width: `${flowZoom}%`,
                  minWidth: '500px',
                  maxWidth: '3000px'
                }}
              >
                <Image
                  src="/flowchart_jalrakshak_ai.svg"
                  alt="JalRakshak AI complete system flowchart"
                  width={2200}
                  height={1400}
                  unoptimized
                  className="h-auto w-full rounded-lg shadow-md"
                  onError={() => setFlowchartLoadError(true)}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleOpenFlowPreview} 
              disabled={flowchartLoadError}
            >
              <Maximize2 className="mr-1.5 h-4 w-4" />
              Open Large Preview
            </Button>
            <Button asChild variant="outline" size="sm">
              <a 
                href="/flowchart_jalrakshak_ai.svg" 
                download="flowchart_jalrakshak_ai.svg"
                className={flowchartLoadError ? "pointer-events-none opacity-50" : ""}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Download SVG
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={flowDialogOpen} onOpenChange={setFlowDialogOpen}>
        <DialogContent 
          className="!max-w-[96vw] !w-[96vw] h-[94vh] max-h-[94vh] overflow-hidden p-0 flex flex-col" 
          showCloseButton={false}
        >
          {/* Modal Header with Controls */}
          <DialogHeader className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold">System Flowchart - Full Preview</DialogTitle>
                <DialogDescription className="text-sm">
                  Zoom in to inspect each stage of the JalRakshak.AI data flow.
                </DialogDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-md border border-border bg-muted/50 p-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setFlowDialogZoom((z) => Math.max(z - 15, 30))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setFlowDialogZoom(100)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setFlowDialogZoom((z) => Math.min(z + 15, 300))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Badge variant="secondary" className="ml-1 font-mono text-xs">
                    {flowDialogZoom}%
                  </Badge>
                </div>
                
                <Button asChild variant="outline" size="sm">
                  <a href="/flowchart_jalrakshak_ai.svg" download="flowchart_jalrakshak_ai.svg">
                    <Download className="mr-1.5 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setFlowDialogOpen(false)}>
                  <X className="mr-1.5 h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Flowchart Container */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-muted/30 to-muted/10 p-6">
            <div 
              className="mx-auto transition-all duration-200 ease-out"
              style={{ 
                width: `${flowDialogZoom}%`,
                minWidth: '600px',
                maxWidth: '4000px'
              }}
            >
              <Image
                src="/flowchart_jalrakshak_ai.svg"
                alt="JalRakshak AI complete system flowchart"
                width={2200}
                height={1400}
                unoptimized
                priority
                className="h-auto w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pin Connections - LoRa Module */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            <Radio className="h-5 w-5" />
            LoRa SX1276 → ESP32 Pin Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-semibold text-foreground">SX1276 Pin</th>
                  <th className="pb-3 text-left font-semibold text-foreground">ESP32 GPIO</th>
                  <th className="pb-3 text-left font-semibold text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {[
                  ["NSS (CS)", "GPIO 5", "SPI chip select"],
                  ["RST", "GPIO 26", "LoRa reset pin"],
                  ["DIO0", "GPIO 25", "TX done / RX done IRQ"],
                  ["DIO1", "GPIO 33", "RX timeout IRQ"],
                  ["DIO2", "GPIO 32", "FHSS change IRQ"],
                  ["MOSI", "GPIO 23", "SPI MOSI (default)"],
                  ["MISO", "GPIO 19", "SPI MISO (default)"],
                  ["SCK", "GPIO 18", "SPI clock (default)"],
                  ["3.3V", "3V3", "Power supply"],
                  ["GND", "GND", "Ground"],
                ].map(([pin, gpio, desc], idx) => (
                  <tr key={idx} className="hover:bg-accent/50 transition-colors">
                    <td className="py-2 text-primary font-medium">{pin}</td>
                    <td className="py-2 text-foreground">{gpio}</td>
                    <td className="py-2 text-muted-foreground">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pin Connections - Sensors */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Sensor Pins → ESP32
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-semibold text-foreground">Sensor</th>
                  <th className="pb-3 text-left font-semibold text-foreground">ESP32 GPIO</th>
                  <th className="pb-3 text-left font-semibold text-foreground">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {[
                  ["TDS (analog out)", "GPIO 2", "12-bit ADC, VREF = 3.3V"],
                  ["pH (analog out)", "GPIO 34", "Input-only ADC pin"],
                  ["DS18B20 (data)", "GPIO 14", "1-Wire; add 4.7 kΩ pull-up to 3.3V"],
                  ["OLED SDA", "GPIO 21", "I²C data (Wire default)"],
                  ["OLED SCL", "GPIO 22", "I²C clock (Wire default)"],
                ].map(([sensor, gpio, note], idx) => (
                  <tr key={idx} className="hover:bg-accent/50 transition-colors">
                    <td className="py-2 text-primary font-medium">{sensor}</td>
                    <td className="py-2 text-foreground">{gpio}</td>
                    <td className="py-2 text-muted-foreground">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Component Overview */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-4">Component Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CircuitBoard className="h-5 w-5 text-primary" />
                ESP32 DevKit
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Voltage:</span>
                <span className="text-foreground font-mono">3.3V - 5V</span>
              </div>
              <div className="flex justify-between">
                <span>Current (Active):</span>
                <span className="text-foreground font-mono">~240 mA</span>
              </div>
              <div className="flex justify-between">
                <span>WiFi/BT:</span>
                <Badge variant="outline" className="text-xs">Supported</Badge>
              </div>
              <div className="pt-2 border-t border-border">
                <a 
                  href="https://www.pandabyte.in/product-page/pandabyte-xlora-esp32-lora-microcontroller-board-arduino-compatible" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs"
                >
                  Buy PandaByte xLoRa →
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                LoRa SX1276/RA-01H
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span className="text-foreground font-mono">868/915 MHz</span>
              </div>
              <div className="flex justify-between">
                <span>Current (TX):</span>
                <span className="text-foreground font-mono">~120 mA</span>
              </div>
              <div className="flex justify-between">
                <span>Range:</span>
                <Badge variant="outline" className="text-xs">Up to 15 km</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                Water Sensors
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>pH Sensor:</span>
                <span className="text-foreground font-mono">0-14 pH</span>
              </div>
              <div className="flex justify-between">
                <span>TDS Sensor:</span>
                <span className="text-foreground font-mono">0-1000 ppm</span>
              </div>
              <div className="flex justify-between">
                <span>DS18B20:</span>
                <Badge variant="outline" className="text-xs">-55°C to 125°C</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Power Supply Requirements */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Power Supply Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Total Power Consumption</h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>ESP32 (Active):</span>
                  <span className="font-mono text-foreground">~240 mA</span>
                </div>
                <div className="flex justify-between">
                  <span>LoRa TX (Peak):</span>
                  <span className="font-mono text-foreground">~120 mA</span>
                </div>
                <div className="flex justify-between">
                  <span>Sensors (Total):</span>
                  <span className="font-mono text-foreground">~50 mA</span>
                </div>
                <div className="flex justify-between">
                  <span>OLED Display:</span>
                  <span className="font-mono text-foreground">~20 mA</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span className="text-foreground">Peak Total:</span>
                  <span className="font-mono text-primary">~430 mA</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Recommended Power Setup</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">LiPo Battery</div>
                    <div className="text-xs text-muted-foreground">3.7V, 2000-3000 mAh</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">TP4056 Charger Module</div>
                    <div className="text-xs text-muted-foreground">For solar/USB charging</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">Estimated Battery Life</div>
                    <div className="text-xs text-muted-foreground">~12-24 hours (60s TX interval)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assembly Notes */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-xl text-primary">Assembly Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 text-sm">
            {[
              {
                step: 1,
                text: "Connect LoRa SX1276 module to ESP32 using SPI pins (MOSI, MISO, SCK, NSS, RST, DIO0-2)."
              },
              {
                step: 2,
                text: "Wire water sensors: TDS to GPIO 2, pH to GPIO 34, DS18B20 to GPIO 14 (with 4.7kΩ pull-up resistor)."
              },
              {
                step: 3,
                text: "Connect OLED display via I²C: SDA to GPIO 21, SCL to GPIO 22."
              },
              {
                step: 4,
                text: "Attach power supply (3.7V LiPo with TP4056 charger) to ESP32 VIN and GND."
              },
              {
                step: 5,
                text: "Verify all connections match the circuit diagram before powering on."
              }
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                  {step}
                </div>
                <p className="text-muted-foreground pt-1">{text}</p>
              </li>
            ))}
          </ol>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-500 mb-2">Important Safety Notes</h4>
                <ul className="text-sm text-amber-200/90 space-y-1">
                  <li>• Ensure all sensors are rated for 3.3V operation (or use level shifters)</li>
                  <li>• DS18B20 requires a 4.7kΩ pull-up resistor on the data line</li>
                  <li>• Waterproof sensors and connections for outdoor deployment</li>
                  <li>• Use proper ESD protection when handling sensitive components</li>
                  <li>• Double-check power polarity before connecting battery</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
