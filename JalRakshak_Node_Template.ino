/*
 * ============================================================
 *  JalRakshak.AI — ESP32 LoRaWAN Sensor Node Template
 *  Live dashboard: https://jalrakshak-ai-dualcore.vercel.app/
 *  Docs / circuit diagram / interactive code gen:
 *    https://jalrakshak-ai-dualcore.vercel.app/docs
 * ============================================================
 *
 *  STEP 1 — Get your TTN credentials
 *  ----------------------------------
 *  1. Log in at https://console.thethingsnetwork.org/
 *  2. Open your application → End Devices → your device
 *  3. Copy DevEUI  (toggle to LSB format — use the ↕ button)
 *  4. Copy AppKey  (MSB format)
 *  5. Paste them below — then compile & upload to the ESP32
 *
 *  STEP 2 — Wiring (see full diagram at /docs)
 *  ----------------------------------
 *  LoRa SX1276        ESP32
 *  NSS  (CS)   →  GPIO 5
 *  RST         →  GPIO 26
 *  DIO0        →  GPIO 25
 *  DIO1        →  GPIO 33
 *  DIO2        →  GPIO 32
 *  MOSI        →  GPIO 23
 *  MISO        →  GPIO 19
 *  SCK         →  GPIO 18
 *  3.3 V       →  3V3
 *  GND         →  GND
 *
 *  TDS sensor  (analog out)  →  GPIO 2
 *  pH  sensor  (analog out)  →  GPIO 34
 *  DS18B20     (data)        →  GPIO 14  (+ 4.7 kΩ pull-up to 3.3 V)
 *  OLED SDA                  →  GPIO 21
 *  OLED SCL                  →  GPIO 22
 *
 *  STEP 3 — Required Arduino libraries
 *  ----------------------------------
 *  • MCCI LoRaWAN LMIC library
 *  • OneWire
 *  • DallasTemperature
 *  • Adafruit SSD1306
 *  • Adafruit GFX Library
 *  • ESP32 board package (espressif/arduino-esp32)
 *
 * ============================================================
 */

#include <lmic.h>
#include "hal/hal.h"
#include <SPI.h>

#include <OneWire.h>
#include <DallasTemperature.h>

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/* ============================================================
   ▼▼▼  PASTE YOUR TTN CREDENTIALS HERE  ▼▼▼
   ============================================================ */

// AppEUI / JoinEUI — LSB format, all-zeros is standard
static const u1_t PROGMEM APPEUI[8] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
};
void os_getArtEui(u1_t* buf) { memcpy_P(buf, APPEUI, 8); }

// DevEUI — LSB format (flip byte order from TTN Console)
// Replace with your device's DevEUI
static const u1_t PROGMEM DEVEUI[8] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00   // <-- REPLACE
};
void os_getDevEui(u1_t* buf) { memcpy_P(buf, DEVEUI, 8); }

// AppKey — MSB format (32 hex characters from TTN Console)
// Replace with your application's AppKey
static const u1_t PROGMEM APPKEY[16] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,   // <-- REPLACE
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00    // <-- REPLACE
};
void os_getDevKey(u1_t* buf) { memcpy_P(buf, APPKEY, 16); }

/* ============================================================
   ▲▲▲  END OF CREDENTIALS  ▲▲▲
   ============================================================ */

/* ── Sensor Pins ──────────────────────────────────────────── */

#define TDS_PIN        2     // TDS sensor analog out  → GPIO 2
#define PH_PIN         34    // pH  sensor analog out  → GPIO 34
#define ONE_WIRE_BUS   14    // DS18B20 data           → GPIO 14

/* ── OLED (128×64 SSD1306 via I²C  SDA=21, SCL=22) ──────── */

#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

/* ── LoRa SX1276 pin map (MCCI LMIC) ─────────────────────── */

const lmic_pinmap lmic_pins = {
  .nss  = 5,
  .rxtx = LMIC_UNUSED_PIN,
  .rst  = 26,
  .dio  = { 25, 33, 32 },
};

/* ── Temperature (DS18B20 1-Wire) ────────────────────────── */

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
float temperature = 25.0;

/* ── TDS ─────────────────────────────────────────────────── */

#define VREF   3.3
#define SCOUNT 30

float baseline = 1.83;   // Calibration offset — adjust for distilled water
int   analogBuffer[SCOUNT];
int   analogBufferTemp[SCOUNT];
float tdsValue = 0;

/* ── pH ──────────────────────────────────────────────────── */

float calibrationOffset = 13.50;  // Adjust using pH 7 buffer solution
int   phBuffer[10];
float phValue = 7.0;

/* ── Timers ──────────────────────────────────────────────── */

unsigned long lastSensorTime  = 0;
unsigned long lastDisplayTime = 0;
const unsigned long SENSOR_INTERVAL  = 2000;
const unsigned long DISPLAY_INTERVAL = 2000;

/* ── LoRa payload ────────────────────────────────────────── */

static uint8_t mydata[6];
static osjob_t sendjob;
const unsigned TX_INTERVAL = 60;   // seconds between uplinks

/* ── Median filter ───────────────────────────────────────── */

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

/* ── Read pH ─────────────────────────────────────────────── */

void readPH() {
  for (int i = 0; i < 10; i++) phBuffer[i] = analogRead(PH_PIN);
  long sum = 0;
  for (int i = 2; i < 8; i++) sum += phBuffer[i];
  float voltage = (float)sum * 3.3 / 4095.0 / 6.0;
  phValue = -4.90 * voltage + calibrationOffset;
}

/* ── Read all sensors ────────────────────────────────────── */

void readSensors() {
  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);

  for (int i = 0; i < SCOUNT; i++) analogBuffer[i] = analogRead(TDS_PIN);
  for (int i = 0; i < SCOUNT; i++) analogBufferTemp[i] = analogBuffer[i];

  float avgVoltage      = getMedianNum(analogBufferTemp, SCOUNT) * VREF / 4095.0;
  float correctedVoltage = avgVoltage - baseline;
  if (correctedVoltage < 0) correctedVoltage = 0;

  float compCoeff   = 1.0 + 0.02 * (temperature - 25.0);
  float compVoltage = correctedVoltage / compCoeff;

  tdsValue = ( 133.42 * compVoltage * compVoltage * compVoltage
             - 255.86 * compVoltage * compVoltage
             + 857.39 * compVoltage ) * 0.5;

  readPH();
}

/* ── Update OLED ─────────────────────────────────────────── */

void updateDisplay() {
  display.clearDisplay();
  display.setCursor(0,  0); display.print("JalRakshak.AI");
  display.setCursor(0, 18); display.print("Temp: "); display.print(temperature, 1); display.print(" C");
  display.setCursor(0, 34); display.print("TDS:  "); display.print(tdsValue,    0); display.print(" ppm");
  display.setCursor(0, 50); display.print("pH:   "); display.print(phValue,     2);
  display.display();
}

/* ── LMIC event handler ──────────────────────────────────── */

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

/* ── Build & queue uplink (6-byte payload) ───────────────── */

void do_send(osjob_t* j) {
  if (LMIC.opmode & OP_TXRXPEND) { Serial.println("TX pending"); return; }

  // Encode:  temp×10 → 2 bytes | tds → 2 bytes | ph×100 → 2 bytes
  int tempInt = (int)(temperature * 10);
  int tdsInt  = (int)tdsValue;
  int phInt   = (int)(phValue * 100);

  mydata[0] = highByte(tempInt); mydata[1] = lowByte(tempInt);
  mydata[2] = highByte(tdsInt);  mydata[3] = lowByte(tdsInt);
  mydata[4] = highByte(phInt);   mydata[5] = lowByte(phInt);

  LMIC_setTxData2(1, mydata, sizeof(mydata), 0);
  Serial.println("Packet queued.");
}

/* ── Setup ───────────────────────────────────────────────── */

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  sensors.begin();

  Wire.begin(21, 22);   // SDA=21, SCL=22
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

/* ── Loop ────────────────────────────────────────────────── */

void loop() {
  os_runloop_once();

  unsigned long now = millis();

  if (now - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = now;
    readSensors();
    Serial.printf("Temp: %.1f C | TDS: %.0f ppm | pH: %.2f\n",
                  temperature, tdsValue, phValue);
  }

  if (now - lastDisplayTime >= DISPLAY_INTERVAL) {
    lastDisplayTime = now;
    updateDisplay();
  }
}
