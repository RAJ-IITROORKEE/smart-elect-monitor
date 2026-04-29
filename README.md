# VoltEdge - Smart Electricity Monitor

> **Live Demo:** [https://voltedge-smart-monitor.vercel.app/](https://voltedge-smart-monitor.vercel.app/)

A complete WiFi-based IoT monitoring system built with ESP32, Next.js, and MongoDB for real-time environmental monitoring and remote device control.

---

## Table of Contents

- [Project Overview](#project-overview)
- [What This Project Does](#what-this-project-does)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Data Flow](#data-flow)
- [Hardware Components](#hardware-components)
- [Hardware Connections](#hardware-connections)
- [ESP32 Firmware](#esp32-firmware)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [JSON Payload Format](#json-payload-format)
- [Setup Instructions](#setup-instructions)
- [Team](#team)

---

## Project Overview

**VoltEdge** is a WiFi-based IoT environmental monitoring and control system designed for real-time temperature, humidity, and occupancy tracking. The system uses ESP32 microcontrollers with DHT22 sensors and PIR motion detectors to collect data, which is then transmitted over WiFi to a cloud-hosted Next.js application backed by MongoDB Atlas.

### Goals

- **Real-time Monitoring**: Track temperature, humidity, and room occupancy in real-time
- **Remote Control**: Control PIR sensors and LEDs remotely from a web dashboard
- **Data Visualization**: Display historical trends with interactive Recharts graphs
- **Smart Alerts**: Automated notifications for high temperature, humidity, and energy waste
- **Scalability**: Support multiple sensor nodes (currently supporting `node_01`)
- **Energy Efficiency**: Monitor and optimize energy consumption patterns

### Use Cases

- **Smart Homes**: Monitor living spaces and automate lighting
- **Hostels & Institutions**: Track occupancy and environmental conditions across multiple rooms
- **Hotels**: Monitor guest room comfort and energy usage
- **Offices**: Optimize HVAC and lighting based on occupancy

---

## What This Project Does

### Key Features

1. **Environmental Monitoring**
   - Measures temperature (°C) and humidity (%) every 10 seconds
   - Detects room occupancy using PIR motion sensor
   - Displays live data on ESP32 OLED screen

2. **Remote Device Control**
   - Toggle PIR sensor on/off from web dashboard
   - Control LED lights remotely via WiFi
   - Instant feedback with status updates every 5 seconds

3. **Web Dashboard**
   - Real-time data visualization with Recharts graphs
   - Admin panel for device management
   - Contact form for support requests
   - Notification system for alerts and warnings

4. **Data Persistence**
   - All sensor readings stored in MongoDB Atlas
   - Historical data analysis and trends
   - Device health monitoring and status tracking

5. **Smart Notifications**
   - Energy waste alerts (LED on when room vacant)
   - High temperature warnings (>34°C)
   - Low/high humidity alerts (<30% or >70%)
   - Occupancy-based recommendations

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (React 19.2.3)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts 3.8.1
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)
- **HTTP Client**: Native Fetch API

### Backend
- **Runtime**: Node.js on Vercel serverless
- **API**: Next.js API Routes (REST)
- **Database**: MongoDB Atlas (Cloud)
- **ORM**: Prisma 5.22.0
- **Authentication**: None (admin access currently open)

### Hardware
- **Microcontroller**: ESP32 Dev Board
- **Temperature/Humidity Sensor**: DHT22 (AM2302)
- **Motion Sensor**: HC-SR501 PIR Sensor
- **Display**: 0.96" OLED SSD1306 (128x64, I2C)
- **LEDs**: 2x Standard LEDs (GPIO 2, GPIO 4)
- **Communication**: WiFi 802.11 b/g/n

### Firmware
- **Platform**: Arduino IDE / PlatformIO
- **Libraries**:
  - WiFi.h (ESP32 WiFi)
  - HTTPClient.h (HTTP requests)
  - DHT.h (DHT22 sensor)
  - Adafruit_SSD1306 & Adafruit_GFX (OLED display)
  - ArduinoJson.h (JSON parsing)

### DevOps
- **Hosting**: Vercel (Frontend + API)
- **Database**: MongoDB Atlas (Cloud)
- **Version Control**: Git + GitHub
- **CI/CD**: Vercel automatic deployments

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React + TypeScript + Tailwind)            │  │
│  │  - Landing Page                                              │  │
│  │  - Live Dashboard (Recharts Graphs)                          │  │
│  │  - Admin Panel (Device Control, Contacts, Notifications)     │  │
│  │  - Contact Form                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS Requests
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND API (Vercel)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes (REST Endpoints)                         │  │
│  │  - /api/sensor-data       (POST/GET sensor readings)         │  │
│  │  - /api/device-control    (GET/POST control states)          │  │
│  │  - /api/contacts          (POST/GET/PATCH/DELETE inquiries)  │  │
│  │  - /api/notifications     (GET/PATCH/DELETE alerts)          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ Prisma Client
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Collections:                                                 │  │
│  │  - sensor_readings      (temp, humidity, occupancy)          │  │
│  │  - devices              (device info, status, lastSeen)      │  │
│  │  - device_controls      (PIR/LED states)                     │  │
│  │  - contact_inquiries    (support requests)                   │  │
│  │  - notifications        (alerts and warnings)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                             ▲
                             │ HTTP POST/GET
                             │ WiFi Network
┌─────────────────────────────────────────────────────────────────────┐
│                      HARDWARE LAYER (ESP32)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ESP32 Microcontroller (node_01)                             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │  │
│  │  │  DHT22     │  │  PIR       │  │  OLED      │             │  │
│  │  │  Sensor    │  │  Sensor    │  │  Display   │             │  │
│  │  │  (GPIO 15) │  │  (GPIO 23) │  │  (I2C)     │             │  │
│  │  └────────────┘  └────────────┘  └────────────┘             │  │
│  │  ┌────────────┐  ┌────────────┐                              │  │
│  │  │  LED       │  │  Status    │                              │  │
│  │  │  Control   │  │  LED       │                              │  │
│  │  │  (GPIO 2)  │  │  (GPIO 4)  │                              │  │
│  │  └────────────┘  └────────────┘                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Sensor Reading Flow (ESP32 → Cloud)

```mermaid
graph LR
    A[ESP32 DHT22/PIR] -->|Read every 10s| B[ESP32 Firmware]
    B -->|Display| C[OLED Screen]
    B -->|HTTP POST JSON| D[/api/sensor-data]
    D -->|Prisma ORM| E[(MongoDB Atlas)]
    D -->|Response 200 OK| B
    E -->|Query| F[Next.js Dashboard]
    F -->|Recharts| G[User Browser]
```

**Steps:**
1. ESP32 reads DHT22 temperature/humidity every 10 seconds
2. PIR sensor continuously monitors motion (20-second timeout)
3. Data formatted as JSON payload
4. HTTP POST to `https://voltedge-smart-monitor.vercel.app/api/sensor-data`
5. API validates data and stores in MongoDB via Prisma
6. Device status updated (`lastSeen`, `totalReadings`, `status: online/offline`)
7. Frontend fetches latest data every 30 seconds
8. Recharts renders time-series graphs

### 2. Control Flow (Dashboard → ESP32)

```mermaid
graph RL
    A[User Dashboard] -->|Click Toggle| B[POST /api/device-control]
    B -->|Update DB| C[(MongoDB device_controls)]
    C -->|Persist state| B
    B -->|Response 200| A
    D[ESP32 Polling] -->|GET every 5s| E[GET /api/device-control?device_id=node_01]
    E -->|Query DB| C
    C -->|Return PIR/LED state| E
    E -->|JSON Response| D
    D -->|digitalWrite| F[GPIO Pins]
    F -->|Control| G[LED GPIO 2]
    F -->|Enable/Disable| H[PIR Sensor]
```

**Steps:**
1. User clicks "Toggle LED" or "Toggle PIR" on dashboard
2. Frontend sends POST to `/api/device-control` with new state
3. API updates MongoDB `device_controls` collection
4. ESP32 polls `/api/device-control?device_id=node_01` every 5 seconds
5. API returns current `pir_enabled` and `led_enabled` states
6. ESP32 parses JSON and updates GPIO pins
7. LED turned on/off, PIR sensor enabled/disabled
8. OLED display updates to show current status

### 3. Notification Flow

```mermaid
graph TD
    A[Sensor Reading] -->|Check Rules| B{Threshold Check}
    B -->|Temp > 34°C| C[Create Notification]
    B -->|Humidity < 30%| C
    B -->|LED ON + Vacant| C
    C -->|Insert| D[(MongoDB notifications)]
    D -->|Fetch| E[Admin Bell Icon]
    E -->|Display Count| F[Red Badge]
    D -->|Query| G[Notifications Page]
    G -->|User Action| H[Mark Resolved/Delete]
```

---

## Hardware Components

### Bill of Materials (BOM)

| Component | Model | Quantity | Purpose |
|-----------|-------|----------|---------|
| Microcontroller | ESP32 Dev Board | 1 | Main processing unit, WiFi connectivity |
| Temperature/Humidity Sensor | DHT22 (AM2302) | 1 | Measures ambient temp (°C) and humidity (%) |
| Motion Sensor | HC-SR501 PIR | 1 | Detects occupancy/movement |
| OLED Display | SSD1306 128x64 I2C | 1 | Shows real-time sensor data locally |
| Dashboard LED | Standard LED | 1 | Remote-controlled indicator (GPIO 2) |
| Status LED | Standard LED | 1 | Motion detection indicator (GPIO 4) |
| Resistors | 220Ω | 2 | Current limiting for LEDs |
| Jumper Wires | Male-to-Female | ~10 | Connections |
| Breadboard | Standard | 1 | Prototyping |
| USB Cable | Micro-USB | 1 | Power + programming |

### Component Details

#### ESP32 Dev Board
- **MCU**: Espressif ESP32 (Dual-core Tensilica LX6)
- **Clock Speed**: 240 MHz
- **RAM**: 520 KB SRAM
- **Flash**: 4 MB
- **WiFi**: 802.11 b/g/n (2.4 GHz)
- **GPIO**: 34 pins (used: 15, 23, 2, 4, 21, 22)
- **Interfaces**: I2C, SPI, UART, ADC, DAC
- **Operating Voltage**: 3.3V (5V tolerant via USB)

#### DHT22 (AM2302) Sensor
- **Temperature Range**: -40°C to 80°C (±0.5°C accuracy)
- **Humidity Range**: 0% to 100% RH (±2% accuracy)
- **Sampling Rate**: 0.5 Hz (once every 2 seconds)
- **Interface**: Single-wire digital (GPIO 15)
- **Operating Voltage**: 3.3V - 5V
- **Pins**: VCC, Data, NC, GND

#### HC-SR501 PIR Sensor
- **Detection Range**: Up to 7 meters
- **Detection Angle**: 120 degrees
- **Trigger**: Repeat trigger (H mode)
- **Delay Time**: Adjustable (1s - 200s, set to 20s in firmware)
- **Interface**: Digital output (HIGH on motion)
- **Operating Voltage**: 4.5V - 20V (powered by 5V)
- **Pins**: VCC, OUT (GPIO 23), GND

#### SSD1306 OLED Display
- **Size**: 0.96 inch
- **Resolution**: 128x64 pixels
- **Interface**: I2C (SDA: GPIO 21, SCL: GPIO 22)
- **I2C Address**: 0x3C
- **Operating Voltage**: 3.3V - 5V
- **Display**: Monochrome (white on black)

---

## Hardware Connections

### Wiring Diagram

```
ESP32 Dev Board Pinout:
┌─────────────────────────────────┐
│         ESP32 (Top View)         │
│                                  │
│  3V3 ●                        ● GND
│  EN  ●                        ● GPIO 23 ──→ PIR OUT
│  VP  ●                        ● GPIO 22 ──→ OLED SCL
│  VN  ●                        ● GPIO 1
│  GPIO 34 ●                    ● GPIO 3
│  GPIO 35 ●                    ● GPIO 21 ──→ OLED SDA
│  GPIO 32 ●                    ● GND
│  GPIO 33 ●                    ● GPIO 19
│  GPIO 25 ●                    ● GPIO 18
│  GPIO 26 ●                    ● GPIO 5
│  GPIO 27 ●                    ● GPIO 17
│  GPIO 14 ●                    ● GPIO 16
│  GPIO 12 ●                    ● GPIO 4 ───→ Status LED (+) ──[ 220Ω ]── GND
│  GPIO 13 ●                    ● GPIO 0
│  GND ●                        ● GPIO 2 ───→ Control LED (+) ──[ 220Ω ]── GND
│  VIN ●                        ● GPIO 15 ──→ DHT22 Data
│                                  │
└─────────────────────────────────┘
```

### Connection Table

| ESP32 Pin | Component | Component Pin | Notes |
|-----------|-----------|---------------|-------|
| **GPIO 15** | DHT22 | Data | Temperature/Humidity sensor data line |
| **3.3V** | DHT22 | VCC | Power supply for DHT22 |
| **GND** | DHT22 | GND | Ground connection |
| **GPIO 23** | PIR Sensor | OUT | Motion detection signal (interrupt) |
| **5V (VIN)** | PIR Sensor | VCC | Power supply for PIR (needs 5V) |
| **GND** | PIR Sensor | GND | Ground connection |
| **GPIO 21** | OLED | SDA | I2C data line |
| **GPIO 22** | OLED | SCL | I2C clock line |
| **3.3V** | OLED | VCC | Power supply for OLED |
| **GND** | OLED | GND | Ground connection |
| **GPIO 2** | Control LED | Anode (+) | Dashboard-controlled LED (via 220Ω resistor) |
| **GPIO 4** | Status LED | Anode (+) | Motion detection indicator (via 220Ω resistor) |
| **GND** | Both LEDs | Cathode (-) | Common ground |

### Physical Setup Steps

1. **Power Off**: Ensure ESP32 is unplugged before wiring
2. **I2C Bus**: Connect OLED SDA to GPIO 21, SCL to GPIO 22
3. **DHT22**: Connect Data to GPIO 15, VCC to 3.3V, GND to GND
4. **PIR Sensor**: Connect OUT to GPIO 23, VCC to 5V, GND to GND
   - Adjust PIR sensitivity and delay potentiometers as needed
5. **LEDs**: Connect anodes to GPIO 2 and GPIO 4 through 220Ω resistors
   - Cathodes to GND
6. **Verify Connections**: Double-check all wiring matches the table
7. **Power On**: Connect ESP32 via USB

### Important Notes

- **PIR Sensor Voltage**: HC-SR501 requires 5V (use VIN/5V pin, not 3.3V)
- **DHT22 Pull-up**: Built-in pull-up in library (no external resistor needed)
- **I2C Address**: OLED must be at 0x3C (default for most SSD1306 modules)
- **LED Resistors**: 220Ω resistors prevent LED burnout (current limiting)
- **Interrupt Pin**: GPIO 23 configured as `INPUT_PULLUP` with rising edge interrupt

---

## ESP32 Firmware

### Firmware Overview (`esp32_sensor_node.ino`)

The ESP32 firmware is written in Arduino C++ and performs three main tasks:

1. **Sensor Data Collection**: Reads DHT22 and PIR sensors
2. **Data Transmission**: Sends JSON payloads to cloud API via WiFi
3. **Remote Control**: Polls API for PIR/LED control states

### Key Configuration

```cpp
// Device Identity
const char* device_id = "node_01";

// WiFi Credentials
const char* ssid = "Sagar";
const char* password = "12345678";

// API Endpoints
const char* serverDataEndpoint = 
    "https://voltedge-smart-monitor.vercel.app/api/sensor-data";
const char* serverControlEndpoint = 
    "https://voltedge-smart-monitor.vercel.app/api/device-control";

// Timing Intervals
const unsigned long sendInterval = 10000;     // Send data every 10 seconds
const unsigned long controlInterval = 5000;   // Check controls every 5 seconds
const unsigned long pirInterval = 1000;       // Update PIR every 1 second
const unsigned long timeSeconds = 20000;      // PIR timeout: 20 seconds
```

### Pin Definitions

```cpp
#define DHT22_PIN 15           // Temperature/Humidity sensor
const uint8_t motionSensor = 23;    // PIR sensor (interrupt)
const uint8_t controlLED = 2;       // Dashboard-controlled LED
const uint8_t statusLED = 4;        // Motion detection LED

// OLED I2C (default pins)
// SDA: GPIO 21
// SCL: GPIO 22
```

### Core Functions

#### 1. `setup()`
Initializes all hardware components:
- Serial communication (115200 baud)
- OLED display (SSD1306, I2C address 0x3C)
- WiFi connection with 20-attempt retry
- DHT22 sensor initialization
- PIR sensor with interrupt on GPIO 23 (RISING edge)
- LED pin modes (OUTPUT)

#### 2. `loop()`
Main execution loop with three timed tasks:

```cpp
void loop() {
  now = millis();

  // Task 1: Check control status from dashboard (every 5 seconds)
  if (now - lastControlCheck >= controlInterval) {
    lastControlCheck = now;
    checkControlStatus();  // Poll API for PIR/LED states
  }

  // Task 2: Update PIR and OLED (every 1 second)
  if (now - lastPIRCheck >= pirInterval) {
    lastPIRCheck = now;
    // Process PIR sensor (if enabled)
    // Update OLED display
    updateDisplay();
  }

  // Task 3: Send sensor data (every 10 seconds)
  if (now - lastSendTime >= sendInterval) {
    lastSendTime = now;
    sendSensorData();  // POST to API
  }
}
```

#### 3. `sendSensorData()`
Reads DHT22 and sends data to cloud:

```cpp
void sendSensorData() {
  // Read DHT22 sensor
  humi  = dht22.readHumidity();
  tempC = dht22.readTemperature();

  // Validate readings
  if (isnan(tempC) || isnan(humi)) {
    Serial.println("✗ DHT22 read failed");
    return;
  }

  // Create JSON payload
  String jsonData = "{";
  jsonData += "\"device_id\": \"" + String(device_id) + "\",";
  jsonData += "\"temperature\": " + String(tempC, 2) + ",";
  jsonData += "\"humidity\": " + String(humi, 2) + ",";
  jsonData += "\"occupied\": " + String(occupied ? "true" : "false");
  jsonData += "}";

  // HTTP POST request
  HTTPClient http;
  http.begin(serverDataEndpoint);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(10000);
  int httpResponseCode = http.POST(jsonData);
  
  // Log response
  if (httpResponseCode > 0) {
    Serial.print("✓ HTTP Response: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}
```

#### 4. `checkControlStatus()`
Polls API for remote control states:

```cpp
void checkControlStatus() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverControlEndpoint) + "?device_id=" + String(device_id);
  http.begin(url);
  http.setTimeout(5000);

  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    
    // Parse JSON response using ArduinoJson
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      bool newPirEnabled = doc["pir_enabled"] | true;
      bool newLedEnabled = doc["led_enabled"] | false;

      // Update PIR state
      if (newPirEnabled != pirEnabled) {
        pirEnabled = newPirEnabled;
        Serial.print("PIR state changed: ");
        Serial.println(pirEnabled ? "ENABLED" : "DISABLED");
      }

      // Update LED state
      if (newLedEnabled != ledEnabled) {
        ledEnabled = newLedEnabled;
        digitalWrite(controlLED, ledEnabled ? HIGH : LOW);
        Serial.print("LED state changed: ");
        Serial.println(ledEnabled ? "ON" : "OFF");
      }
    }
  }

  http.end();
}
```

#### 5. `updateDisplay()`
Renders sensor data on OLED:

```cpp
void updateDisplay() {
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("ESP32 Monitor");
  display.drawLine(0, 10, SCREEN_WIDTH, 10, WHITE);

  display.setCursor(0, 15);
  display.print("Temp: ");
  display.print(tempC, 1);
  display.println(" C");

  display.setCursor(0, 27);
  display.print("Humidity: ");
  display.print(humi, 1);
  display.println("%");

  display.setCursor(0, 39);
  if (pirEnabled) {
    display.print("Occupied: ");
    display.println(occupied ? "YES" : "NO");
  } else {
    display.println("Occupied: OFF");
  }

  display.setCursor(0, 51);
  display.print("PIR:");
  display.print(pirEnabled ? "ON" : "OFF");
  display.print(" LED:");
  display.println(ledEnabled ? "ON" : "OFF");

  display.display();
}
```

#### 6. `motionISR()`
Interrupt Service Routine for PIR:

```cpp
void ARDUINO_ISR_ATTR motionISR() {
  lastTrigger = millis();
  startTimer = true;
}
```

### PIR Motion Detection Logic

The firmware uses interrupt-based motion detection with a 20-second timeout:

1. **Motion Detected**: PIR sensor triggers RISING interrupt → `motionISR()` called
2. **Status Update**: `startTimer = true`, `occupied = true`, status LED turns ON
3. **Timeout Check**: If no motion for 20 seconds, `occupied = false`, LED OFF
4. **PIR Disabled**: If PIR disabled from dashboard, occupied state forced to false

```cpp
if (pirEnabled) {
  if (startTimer && !printMotion) {
    digitalWrite(statusLED, HIGH);
    Serial.println("MOTION DETECTED!!!");
    printMotion = true;
    occupied = true;
  }

  if (startTimer && (now - lastTrigger > timeSeconds)) {
    Serial.println("Motion stopped...");
    digitalWrite(statusLED, LOW);
    startTimer = false;
    printMotion = false;
    occupied = false;
  }
} else {
  // PIR disabled - reset states
  if (occupied) {
    occupied = false;
    digitalWrite(statusLED, LOW);
    startTimer = false;
    printMotion = false;
  }
}
```

### Required Libraries

Install via Arduino Library Manager:

```
WiFi (built-in ESP32)
HTTPClient (built-in ESP32)
DHT sensor library by Adafruit
Adafruit GFX Library
Adafruit SSD1306
ArduinoJson (v6.x)
Wire (I2C, built-in)
```

### Uploading Firmware

1. Install [Arduino IDE](https://www.arduino.cc/en/software) or [PlatformIO](https://platformio.org/)
2. Add ESP32 board support:
   - Arduino IDE: File → Preferences → Additional Board Manager URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install
3. Select board: **ESP32 Dev Module**
4. Connect ESP32 via USB
5. Select correct COM port
6. Update WiFi credentials and API endpoint in `.ino` file
7. Upload sketch (Ctrl+U)
8. Open Serial Monitor (115200 baud) to view logs

---

## API Endpoints

### Base URL
```
https://voltedge-smart-monitor.vercel.app/api
```

All endpoints return JSON responses with CORS enabled.

---

### 1. Sensor Data API

#### **POST** `/api/sensor-data`
Store sensor readings from ESP32.

**Request Body:**
```json
{
  "device_id": "node_01",
  "temperature": 28.50,
  "humidity": 65.30,
  "occupied": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Sensor data saved successfully",
  "id": "507f1f77bcf86cd799439011",
  "device_id": "node_01",
  "timestamp": "2026-04-30T05:23:15.234Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "device_id, temperature, humidity, and occupied are required"
}
```

---

#### **GET** `/api/sensor-data?device_id=node_01&limit=100`
Retrieve sensor readings and statistics.

**Query Parameters:**
- `device_id` (required): Device identifier (e.g., "node_01")
- `limit` (optional): Number of readings to return (default: 50, max: 500)
- `hours` (optional): Filter readings from last N hours (e.g., 24)

**Response (200 OK):**
```json
{
  "success": true,
  "device_id": "node_01",
  "count": 100,
  "totalCount": 2453,
  "latest": {
    "id": "507f1f77bcf86cd799439011",
    "deviceId": "node_01",
    "deviceName": "Living Room Node",
    "temperature": 28.5,
    "humidity": 65.3,
    "occupied": true,
    "createdAt": "2026-04-30T05:23:15.234Z"
  },
  "readings": [
    {
      "id": "507f1f77bcf86cd799439011",
      "temperature": 28.5,
      "humidity": 65.3,
      "occupied": true,
      "createdAt": "2026-04-30T05:23:15.234Z"
    }
    // ... more readings
  ],
  "series": {
    "temperature": [
      { "timestamp": "2026-04-30T05:23:15.234Z", "value": 28.5 }
      // ... more data points
    ],
    "humidity": [
      { "timestamp": "2026-04-30T05:23:15.234Z", "value": 65.3 }
    ],
    "occupancy": [
      { "timestamp": "2026-04-30T05:23:15.234Z", "occupied": true }
    ]
  },
  "stats": {
    "avgTemperature": 29.8,
    "avgHumidity": 62.5,
    "minTemp": 24.2,
    "maxTemp": 35.1,
    "minHumidity": 45.0,
    "maxHumidity": 78.5,
    "occupancyRate": 42.3
  },
  "health": {
    "status": "online",
    "lastSeen": "2026-04-30T05:23:15.234Z",
    "message": "Device is actively reporting (last seen 3 seconds ago)"
  },
  "deviceInfo": {
    "deviceId": "node_01",
    "deviceName": "Living Room Node",
    "location": "Living Room",
    "status": "online",
    "totalReadings": 2453,
    "lastSeen": "2026-04-30T05:23:15.234Z",
    "createdAt": "2026-04-28T10:00:00.000Z"
  }
}
```

---

### 2. Device Control API

#### **GET** `/api/device-control?device_id=node_01`
Get current control states for device (polled by ESP32 every 5 seconds).

**Query Parameters:**
- `device_id` (required): Device identifier

**Response (200 OK):**
```json
{
  "success": true,
  "device_id": "node_01",
  "pir_enabled": true,
  "led_enabled": false,
  "timestamp": "2026-04-30T05:23:15.234Z"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No control settings found for device: node_01",
  "device_id": "node_01",
  "pir_enabled": true,
  "led_enabled": false
}
```

---

#### **POST** `/api/device-control`
Update control states from dashboard.

**Request Body:**
```json
{
  "device_id": "node_01",
  "pir_enabled": false,
  "led_enabled": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Control settings updated for device: node_01",
  "device_id": "node_01",
  "pir_enabled": false,
  "led_enabled": true,
  "timestamp": "2026-04-30T05:23:15.234Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "device_id is required"
}
```

---

### 3. Contact API

#### **POST** `/api/contacts`
Submit contact inquiry from website form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I'm interested in deploying VoltEdge in my institution."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": "507f1f77bcf86cd799439011"
}
```

---

#### **GET** `/api/contacts?status=new&limit=50`
Retrieve contact inquiries (admin only).

**Query Parameters:**
- `status` (optional): Filter by status ("new", "acknowledged", "resolved")
- `limit` (optional): Number of submissions (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 12,
  "total": 47,
  "submissions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Product Inquiry",
      "message": "I'm interested in deploying VoltEdge...",
      "status": "new",
      "createdAt": "2026-04-30T05:23:15.234Z",
      "updatedAt": "2026-04-30T05:23:15.234Z"
    }
    // ... more submissions
  ]
}
```

---

#### **PATCH** `/api/contacts`
Update contact status.

**Request Body:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "status": "resolved"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Submission status updated",
  "submission": {
    "id": "507f1f77bcf86cd799439011",
    "status": "resolved",
    "updatedAt": "2026-04-30T05:25:00.000Z"
  }
}
```

---

#### **DELETE** `/api/contacts?id=507f1f77bcf86cd799439011`
Delete contact submission.

**Query Parameters:**
- `id` (required): Submission ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact submission deleted successfully"
}
```

---

### 4. Notifications API

#### **GET** `/api/notifications?status=active&limit=100`
Retrieve system notifications.

**Query Parameters:**
- `status` (optional): Filter by status ("active", "acknowledged", "resolved")
- `device_id` (optional): Filter by device
- `severity` (optional): Filter by severity ("info", "warning", "error")
- `limit` (optional): Number of notifications (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "count": 8,
  "total": 143,
  "unread": 8,
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439011",
      "deviceId": "node_01",
      "type": "high_temp",
      "title": "High Temperature Alert",
      "message": "Temperature exceeded 34°C threshold in Living Room",
      "severity": "warning",
      "status": "active",
      "temperature": 34.5,
      "humidity": 68.2,
      "occupied": true,
      "createdAt": "2026-04-30T05:23:15.234Z",
      "updatedAt": "2026-04-30T05:23:15.234Z"
    }
    // ... more notifications
  ]
}
```

---

#### **PATCH** `/api/notifications`
Update notification status.

**Request Body:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "status": "resolved"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification status updated",
  "notification": {
    "id": "507f1f77bcf86cd799439011",
    "status": "resolved",
    "updatedAt": "2026-04-30T05:25:00.000Z"
  }
}
```

---

#### **DELETE** `/api/notifications?id=507f1f77bcf86cd799439011`
Delete notification.

**Query Parameters:**
- `id` (required): Notification ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Database Schema

### MongoDB Collections (via Prisma ORM)

#### 1. `sensor_readings`
Stores all sensor data from ESP32 devices.

```prisma
model SensorReading {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  deviceId    String
  deviceName  String   @default("node_01")
  
  temperature Float    // Celsius
  humidity    Float    // Percentage
  occupied    Boolean  // PIR detection
  
  rssi        Int?     // WiFi signal strength (optional)
  
  createdAt   DateTime @default(now())
  
  @@index([deviceId, createdAt])
  @@index([createdAt])
  @@map("sensor_readings")
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "deviceId": "node_01",
  "deviceName": "Living Room Node",
  "temperature": 28.5,
  "humidity": 65.3,
  "occupied": true,
  "rssi": -52,
  "createdAt": "2026-04-30T05:23:15.234Z"
}
```

---

#### 2. `devices`
Tracks device metadata and health status.

```prisma
model DeviceInfo {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  deviceId      String   @unique
  deviceName    String
  location      String?
  
  status        String   @default("offline") // "online" | "offline"
  lastSeen      DateTime @default(now())
  totalReadings Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([status])
  @@map("devices")
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "deviceId": "node_01",
  "deviceName": "Living Room Node",
  "location": "Living Room",
  "status": "online",
  "lastSeen": "2026-04-30T05:23:15.234Z",
  "totalReadings": 2453,
  "createdAt": "2026-04-28T10:00:00.000Z",
  "updatedAt": "2026-04-30T05:23:15.234Z"
}
```

---

#### 3. `device_controls`
Stores remote control states (PIR/LED).

```prisma
model DeviceControl {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  deviceId   String   @unique
  
  pirEnabled Boolean  @default(true)
  ledEnabled Boolean  @default(false)
  
  updatedAt  DateTime @updatedAt
  createdAt  DateTime @default(now())
  
  @@map("device_controls")
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "deviceId": "node_01",
  "pirEnabled": true,
  "ledEnabled": false,
  "createdAt": "2026-04-28T10:00:00.000Z",
  "updatedAt": "2026-04-30T05:23:15.234Z"
}
```

---

#### 4. `contact_inquiries`
Stores contact form submissions.

```prisma
model ContactInquiry {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String
  subject   String
  message   String
  status    String   @default("new") // "new" | "acknowledged" | "resolved"
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([status, createdAt])
  @@index([createdAt])
  @@map("contact_inquiries")
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Product Inquiry",
  "message": "I'm interested in deploying VoltEdge in my institution.",
  "status": "new",
  "createdAt": "2026-04-30T05:23:15.234Z",
  "updatedAt": "2026-04-30T05:23:15.234Z"
}
```

---

#### 5. `notifications`
System alerts and warnings.

```prisma
model Notification {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  deviceId    String
  type        String   // "energy_waste" | "high_temp" | "low_humidity" | "high_humidity"
  title       String
  message     String
  severity    String   @default("warning") // "info" | "warning" | "error"
  status      String   @default("active")   // "active" | "acknowledged" | "resolved"
  
  temperature Float?
  humidity    Float?
  occupied    Boolean?
  ledEnabled  Boolean?
  pirEnabled  Boolean?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([deviceId, createdAt])
  @@index([status, createdAt])
  @@index([createdAt])
  @@map("notifications")
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "deviceId": "node_01",
  "type": "high_temp",
  "title": "High Temperature Alert",
  "message": "Temperature exceeded 34°C threshold in Living Room",
  "severity": "warning",
  "status": "active",
  "temperature": 34.5,
  "humidity": 68.2,
  "occupied": true,
  "ledEnabled": false,
  "pirEnabled": true,
  "createdAt": "2026-04-30T05:23:15.234Z",
  "updatedAt": "2026-04-30T05:23:15.234Z"
}
```

---

## JSON Payload Format

### ESP32 → Cloud (Sensor Data)

**Endpoint**: `POST /api/sensor-data`

```json
{
  "device_id": "node_01",
  "temperature": 28.50,
  "humidity": 65.30,
  "occupied": true
}
```

**Field Descriptions:**
- `device_id` (string, required): Unique device identifier
- `temperature` (float, required): Temperature in Celsius (2 decimal places)
- `humidity` (float, required): Relative humidity percentage (2 decimal places)
- `occupied` (boolean, required): PIR motion detection status

---

### Cloud → ESP32 (Control Data)

**Endpoint**: `GET /api/device-control?device_id=node_01`

```json
{
  "success": true,
  "device_id": "node_01",
  "pir_enabled": true,
  "led_enabled": false,
  "timestamp": "2026-04-30T05:23:15.234Z"
}
```

**Field Descriptions:**
- `success` (boolean): Operation status
- `device_id` (string): Device identifier
- `pir_enabled` (boolean): Enable/disable PIR sensor
- `led_enabled` (boolean): Turn LED on/off
- `timestamp` (string, ISO 8601): Last update time

---

## Setup Instructions

### Prerequisites

- **Hardware**: ESP32, DHT22, PIR sensor, OLED, LEDs, resistors, breadboard
- **Software**: Arduino IDE or PlatformIO, Node.js 18+, MongoDB Atlas account
- **Tools**: USB cable, WiFi network (2.4 GHz)

---

### 1. Hardware Setup

1. Follow the [Hardware Connections](#hardware-connections) section
2. Double-check all wiring before powering on
3. Adjust PIR sensor potentiometers (sensitivity, delay)
4. Connect ESP32 to computer via USB

---

### 2. ESP32 Firmware Upload

1. Install Arduino IDE: https://www.arduino.cc/en/software
2. Add ESP32 board support:
   - File → Preferences
   - Additional Board Manager URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Install "ESP32"
3. Install required libraries (Sketch → Include Library → Manage Libraries):
   - DHT sensor library by Adafruit
   - Adafruit GFX Library
   - Adafruit SSD1306
   - ArduinoJson (v6.x)
4. Open `esp32_sensor_node.ino`
5. Update configuration:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   const char* device_id = "node_01";  // Or your device ID
   ```
6. Select board: **ESP32 Dev Module**
7. Select correct COM port
8. Upload (Ctrl+U)
9. Open Serial Monitor (115200 baud) to verify connection

---

### 3. MongoDB Atlas Setup

1. Create account: https://www.mongodb.com/cloud/atlas/register
2. Create new cluster (free tier: M0)
3. Database Access → Add Database User (username, password)
4. Network Access → Add IP Address (allow from anywhere: 0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` with your database user password
7. URL-encode special characters (e.g., `@` → `%40`)

**Example Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/voltedge-monitor
```

---

### 4. Backend Setup

1. Clone repository:
   ```bash
   git clone https://github.com/RAJ-IITROORKEE/smart-elect-monitor.git
   cd smart-elect-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in root:
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/voltedge-monitor"
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Push database schema:
   ```bash
   npx prisma db push
   ```

6. Run development server:
   ```bash
   npm run dev
   ```

7. Open http://localhost:3000

---

### 5. Deploy to Vercel

1. Push code to GitHub
2. Create Vercel account: https://vercel.com/signup
3. Import GitHub repository
4. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: Your MongoDB connection string
5. Deploy
6. Copy deployment URL (e.g., `https://your-project.vercel.app`)
7. Update ESP32 firmware with new API endpoint:
   ```cpp
   const char* serverDataEndpoint = "https://your-project.vercel.app/api/sensor-data";
   const char* serverControlEndpoint = "https://your-project.vercel.app/api/device-control";
   ```
8. Re-upload firmware to ESP32

---

### 6. Seed Demo Data (Optional)

To populate database with demo data for testing:

1. Create `seed.ts` in root directory
2. Run: `npx tsx seed.ts`
3. Data includes:
   - 100 sensor readings (24 hours)
   - 10 contact inquiries (7 days)
   - 10 notifications (various alerts)
   - Device info for node_01
   - Initial device controls

---

### 7. Verify System

1. **ESP32**: Check Serial Monitor for successful WiFi connection and data transmission
2. **OLED**: Verify display shows temp, humidity, occupancy, PIR/LED status
3. **Dashboard**: Visit live URL and confirm real-time data updates
4. **Control**: Toggle PIR/LED from dashboard, verify ESP32 responds within 5 seconds
5. **Database**: Check MongoDB Atlas for new sensor_readings documents
6. **Graphs**: Confirm Recharts displays time-series data

---

## Team

### Current Team

- **Sagar Baruah**  
  Electronics & Communication Engineering (B.Tech, 3rd Year)  
  Indian Institute of Technology, Roorkee  
  Role: Full-stack Developer, IoT Hardware Engineer

- **Chintapalli Ponting**  
  Role: Backend Developer, Database Management

### Project Supervisor

- **Dr. Rajib Kumar Panigrahi**  
  Associate Professor  
  Indian Institute of Technology, Roorkee

---

## Project Structure

```
smart-electricity-monitor/
├── app/
│   ├── (main)/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin/
│   │   ├── contacts/
│   │   ├── dashboard/
│   │   ├── live-data/
│   │   ├── notifications/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── sensor-data/
│   │   │   └── route.ts
│   │   ├── device-control/
│   │   │   └── route.ts
│   │   ├── contacts/
│   │   │   └── route.ts
│   │   └── notifications/
│   │       └── route.ts
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── admin/
│   ├── hero-section.tsx
│   ├── live-monitor.tsx
│   └── ...
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── public/
├── esp32_sensor_node.ino
├── .env
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Features Roadmap

### Completed ✓
- [x] ESP32 firmware with DHT22, PIR, OLED
- [x] WiFi data transmission
- [x] MongoDB + Prisma backend
- [x] REST API endpoints
- [x] Real-time dashboard with Recharts
- [x] Remote PIR/LED control
- [x] Admin panel (contacts, notifications)
- [x] Device health monitoring
- [x] Dark/light theme
- [x] Responsive design
- [x] Vercel deployment

### In Progress 🚧
- [ ] User authentication (admin login)
- [ ] Multi-device support (multiple nodes)
- [ ] Email notifications
- [ ] Historical data export (CSV)

### Planned 🔮
- [ ] LoRaWAN support for long-range communication
- [ ] Energy consumption tracking (current sensors)
- [ ] Predictive analytics (ML models)
- [ ] Mobile app (React Native)
- [ ] Automation rules engine
- [ ] Voice control integration (Alexa, Google Home)

---

## License

This project is part of an academic research initiative at IIT Roorkee and is intended for educational and research purposes.

---

## Acknowledgments

- **shadcn/ui** for beautiful React components
- **Vercel** for seamless deployment
- **MongoDB Atlas** for cloud database
- **Recharts** for data visualization
- **Adafruit** for sensor libraries
- **ESP32 Community** for comprehensive documentation

---

## Contact

For questions, suggestions, or collaboration inquiries, please use the [contact form](https://voltedge-smart-monitor.vercel.app/contact) on the website or raise an issue in the GitHub repository.

**Live Demo**: [https://voltedge-smart-monitor.vercel.app/](https://voltedge-smart-monitor.vercel.app/)

---

**Built with ❤️ by Team VoltEdge at IIT Roorkee**
