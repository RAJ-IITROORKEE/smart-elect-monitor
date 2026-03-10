"use client";

import { useState } from "react";
import { Copy, Check, Download, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Hex formatting helpers ─────────────────────────────────────────── */

function formatHex(value: string, expectedBytes: number): string {
  const cleaned = value.replaceAll(/0x/gi, "").replaceAll(/[^0-9A-Fa-f]/g, "");
  const limited = cleaned.slice(0, expectedBytes * 2);
  return (limited.match(/.{1,2}/g)?.join(" ") ?? "").toUpperCase();
}

function hexToArray(hex: string): string {
  return hex
    .split(" ")
    .filter((b) => b.length === 2)
    .map((b) => `0x${b}`)
    .join(", ");
}

/* ── Code template ──────────────────────────────────────────────────── */

function buildCode(appEui: string, devEui: string, appKey: string): string {
  const appEuiArr = hexToArray(appEui) || "0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00";
  const devEuiArr = hexToArray(devEui) || "/* DEVEUI not entered */";
  const appKeyBytes = appKey.split(" ").filter((b) => b.length === 2).map((b) => `0x${b}`);
  const appKeyLine1 = appKeyBytes.slice(0, 8).join(", ");
  const appKeyLine2 = appKeyBytes.slice(8).join(", ");
  const appKeyStr = appKeyBytes.length === 16
    ? `\n  ${appKeyLine1},\n  ${appKeyLine2}`
    : "/* APPKEY not entered */";

  return `#include <lmic.h>
#include "hal/hal.h"
#include <SPI.h>

#include <OneWire.h>
#include <DallasTemperature.h>

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/* ============================================================
   STEP 1 — Paste your TTN credentials below.
   Get them from: TTN Console → Your App → End Devices → Device Overview
   ============================================================ */

/* APPEUI — LSB format, usually all-zeros */
static const u1_t PROGMEM APPEUI[8] = { ${appEuiArr} };
void os_getArtEui(u1_t* buf) { memcpy_P(buf, APPEUI, 8); }

/* DEVEUI — LSB format (flip bytes from TTN Console) */
static const u1_t PROGMEM DEVEUI[8] = { ${devEuiArr} };
void os_getDevEui(u1_t* buf) { memcpy_P(buf, DEVEUI, 8); }

/* APPKEY — MSB format */
static const u1_t PROGMEM APPKEY[16] = {${appKeyStr}
};
void os_getDevKey(u1_t* buf) { memcpy_P(buf, APPKEY, 16); }

/* ============================================================
   STEP 2 — Pin definitions (match the wiring diagram)
   ============================================================ */

#define TDS_PIN        2     // TDS sensor analog out → GPIO 2
#define PH_PIN         34    // pH sensor analog out  → GPIO 34
#define ONE_WIRE_BUS   14    // DS18B20 data          → GPIO 14

/* ============================================================
   OLED (128×64 SSD1306) — I²C on SDA=21, SCL=22
   ============================================================ */

#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

/* ============================================================
   LoRa SX1276 SPI pin map (MCCI LMIC)
     NSS  → GPIO 5
     RST  → GPIO 26
     DIO0 → GPIO 25
     DIO1 → GPIO 33
     DIO2 → GPIO 32
     MOSI → GPIO 23 (default SPI)
     MISO → GPIO 19 (default SPI)
     SCK  → GPIO 18 (default SPI)
   ============================================================ */

const lmic_pinmap lmic_pins = {
  .nss  = 5,
  .rxtx = LMIC_UNUSED_PIN,
  .rst  = 26,
  .dio  = { 25, 33, 32 },
};

/* ── Temperature (DS18B20) ──────────────────────────────────── */

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
float temperature = 25;

/* ── TDS ────────────────────────────────────────────────────── */

#define VREF   3.3
#define SCOUNT 30

float   baseline = 1.83; // calibration offset (adjust if needed)
int     analogBuffer[SCOUNT];
int     analogBufferTemp[SCOUNT];
float   tdsValue = 0;

/* ── pH ─────────────────────────────────────────────────────── */

float calibrationOffset = 13.50; // adjust for your pH probe
int   phBuffer[10];
float phValue = 7;

/* ── Timers ─────────────────────────────────────────────────── */

unsigned long lastSensorTime  = 0;
unsigned long lastDisplayTime = 0;
const unsigned long SENSOR_INTERVAL  = 2000; // ms
const unsigned long DISPLAY_INTERVAL = 2000; // ms

/* ── LoRa payload ───────────────────────────────────────────── */

static uint8_t mydata[6];
static osjob_t sendjob;
const unsigned TX_INTERVAL = 60; // seconds between uplinks

/* ── Median filter ──────────────────────────────────────────── */

int getMedianNum(int bArray[], int iFilterLen) {
  int bTab[iFilterLen];
  for (byte i = 0; i < iFilterLen; i++) bTab[i] = bArray[i];
  int i, j, temp;
  for (j = 0; j < iFilterLen - 1; j++)
    for (i = 0; i < iFilterLen - j - 1; i++)
      if (bTab[i] > bTab[i + 1]) {
        temp = bTab[i]; bTab[i] = bTab[i + 1]; bTab[i + 1] = temp;
      }
  if ((iFilterLen & 1) > 0) temp = bTab[(iFilterLen - 1) / 2];
  else temp = (bTab[iFilterLen / 2] + bTab[iFilterLen / 2 - 1]) / 2;
  return temp;
}

/* ── Read pH ────────────────────────────────────────────────── */

void readPH() {
  for (int i = 0; i < 10; i++) phBuffer[i] = analogRead(PH_PIN);
  long sum = 0;
  for (int i = 2; i < 8; i++) sum += phBuffer[i];
  float voltage = (float)sum * 3.3 / 4095.0 / 6.0;
  phValue = -4.90 * voltage + calibrationOffset;
}

/* ── Read all sensors ───────────────────────────────────────── */

void readSensors() {
  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);

  for (int i = 0; i < SCOUNT; i++) analogBuffer[i] = analogRead(TDS_PIN);
  for (int i = 0; i < SCOUNT; i++) analogBufferTemp[i] = analogBuffer[i];

  float avgVoltage = getMedianNum(analogBufferTemp, SCOUNT) * VREF / 4095.0;
  float correctedVoltage = avgVoltage - baseline;
  if (correctedVoltage < 0) correctedVoltage = 0;

  float compCoeff   = 1.0 + 0.02 * (temperature - 25.0);
  float compVoltage = correctedVoltage / compCoeff;

  tdsValue = (133.42 * compVoltage * compVoltage * compVoltage
            - 255.86 * compVoltage * compVoltage
            + 857.39 * compVoltage) * 0.5;

  readPH();
}

/* ── Update OLED ────────────────────────────────────────────── */

void updateDisplay() {
  display.clearDisplay();
  display.setCursor(0,  0); display.print("Water Monitor");
  display.setCursor(0, 18); display.print("Temp: "); display.print(temperature, 1); display.print(" C");
  display.setCursor(0, 34); display.print("TDS:  "); display.print(tdsValue, 0);    display.print(" ppm");
  display.setCursor(0, 50); display.print("pH:   "); display.print(phValue, 2);
  display.display();
}

/* ── LMIC event handler ─────────────────────────────────────── */

void onEvent(ev_t ev) {
  switch (ev) {
    case EV_JOINING:
      Serial.println("Joining TTN...");
      break;
    case EV_JOINED:
      Serial.println("Joined TTN!");
      LMIC_setLinkCheckMode(0);
      break;
    case EV_TXCOMPLETE:
      Serial.println("Uplink sent.");
      os_setTimedCallback(&sendjob, os_getTime() + sec2osticks(TX_INTERVAL), do_send);
      break;
    default:
      break;
  }
}

/* ── Build & queue uplink packet ────────────────────────────── */

void do_send(osjob_t* j) {
  if (LMIC.opmode & OP_TXRXPEND) { Serial.println("TX pending"); return; }

  int tempInt = temperature * 10;
  int tdsInt  = tdsValue;
  int phInt   = phValue * 100;

  mydata[0] = highByte(tempInt); mydata[1] = lowByte(tempInt);
  mydata[2] = highByte(tdsInt);  mydata[3] = lowByte(tdsInt);
  mydata[4] = highByte(phInt);   mydata[5] = lowByte(phInt);

  LMIC_setTxData2(1, mydata, sizeof(mydata), 0);
  Serial.println("Packet queued.");
}

/* ── Setup ──────────────────────────────────────────────────── */

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  sensors.begin();

  Wire.begin(21, 22); // SDA=21, SCL=22
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("JalRakshak.AI");
  display.println("Starting...");
  display.display();

  os_init();
  LMIC_reset();
  do_send(&sendjob);
}

/* ── Loop ───────────────────────────────────────────────────── */

void loop() {
  os_runloop_once();

  unsigned long now = millis();

  if (now - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = now;
    readSensors();
    Serial.printf("Temp: %.1f | TDS: %.0f ppm | pH: %.2f\\n", temperature, tdsValue, phValue);
  }

  if (now - lastDisplayTime >= DISPLAY_INTERVAL) {
    lastDisplayTime = now;
    updateDisplay();
  }
}
`;
}

/* ── Component ──────────────────────────────────────────────── */

export function ArduinoCodeGen() {
  const defaultAppEui = "00 00 00 00 00 00 00 00";
  const [appEui, setAppEui] = useState(defaultAppEui);
  const [devEui, setDevEui] = useState("");
  const [appKey, setAppKey] = useState("");
  const [copied, setCopied] = useState(false);

  const code = buildCode(appEui, devEui, appKey);

  const devEuiValid = devEui.split(" ").filter((b) => b.length === 2).length === 8;
  const appKeyValid = appKey.split(" ").filter((b) => b.length === 2).length === 16;
  const isValid = devEuiValid && appKeyValid;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `JalRakshak_${devEui.replaceAll(/\s/g, "_") || "node"}.ino`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Credential inputs */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Enter TTN Device Credentials</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            TTN Console → Your Application → End Devices → Device Overview
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* APPEUI */}
          <div>
            <label htmlFor="appEui" className="mb-1.5 block text-xs font-medium text-foreground">
              AppEUI / JoinEUI — 8 bytes (LSB)
            </label>
            <input
              id="appEui"
              value={appEui}
              onChange={(e) => setAppEui(formatHex(e.target.value, 8))}
              placeholder="00 00 00 00 00 00 00 00"
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Typically all zeros. Accepts any hex format (e.g. <code className="text-primary">0x00, 0x01...</code>).
            </p>
          </div>

          {/* DEVEUI */}
          <div>
            <label htmlFor="devEui" className="mb-1.5 block text-xs font-medium text-foreground">
              DevEUI — 8 bytes{" "}
              <span className="text-amber-400">* LSB (reverse byte order from TTN)</span>
            </label>
            <input
              id="devEui"
              value={devEui}
              onChange={(e) => setDevEui(formatHex(e.target.value, 8))}
              placeholder="Paste from TTN Console"
              className={cn(
                "w-full rounded-lg border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
                devEui && !devEuiValid ? "border-red-500/60" : "border-border"
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              From TTN Console → End device → DevEUI. Use the <strong>↕ LSB</strong> copy button.
            </p>
          </div>

          {/* APPKEY */}
          <div>
            <label htmlFor="appKey" className="mb-1.5 block text-xs font-medium text-foreground">
              AppKey — 16 bytes{" "}
              <span className="text-amber-400">* MSB</span>
            </label>
            <input
              id="appKey"
              value={appKey}
              onChange={(e) => setAppKey(formatHex(e.target.value, 16))}
              placeholder="Paste from TTN Console"
              className={cn(
                "w-full rounded-lg border bg-muted px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40",
                appKey && !appKeyValid ? "border-red-500/60" : "border-border"
              )}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              From TTN Console → End device → AppKey. Use the <strong>MSB</strong> copy button.
            </p>
          </div>

          {/* Validation warning */}
          {(!isValid && (devEui || appKey)) && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-300">
                {!devEuiValid && devEui && "DevEUI must be 8 bytes. "}
                {!appKeyValid && appKey && "AppKey must be 16 bytes."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code preview */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-foreground">Generated Arduino Sketch</CardTitle>
              {isValid ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px]">
                  Ready
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">
                  Fill credentials above
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCopy}
                disabled={!isValid}
                className="gap-1.5 text-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!isValid}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                .ino
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <textarea
            readOnly
            value={code}
            rows={20}
            className="w-full resize-none rounded-b-xl border-t border-border bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200 focus:outline-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
