# JalRakshak.AI — IoT Water Quality Monitor

> **Microsoft AI Unlock Hackathon · AI for India Track**  
> Built by **DualCode Team** — Raj Rabidas & Mansi Rajput, IIT Roorkee

Real-time water quality monitoring powered by LoRaWAN IoT sensor nodes and an AI prediction engine. Physical sensors (ESP32 + LoRa SX1276) transmit pH, TDS, and temperature over The Things Network (TTN). A Next.js dashboard receives data via TTN webhook, persists it in MongoDB, and runs AI-based water safety predictions.

---

## What It Does

| Capability | Details |
|---|---|
| **Live sensor ingestion** | Receives TTN uplink webhooks from LoRaWAN nodes; decodes both TTN-decoded payloads and raw Base64 bytes |
| **Water quality prediction** | Classifies water as **Safe / Unsafe** with a safety score (0–100), risk level, possible causes, recommended actions, and a trend-based future risk |
| **Multi-device dashboard** | Shows a card per IoT device with latest readings, AI prediction badge, signal strength (RSSI/SNR), and a 50-point history chart |
| **Model simulator** | Interactive sliders (pH, TDS, turbidity, conductivity, temperature) to test the AI engine without hardware |
| **Offline resilience** | Falls back from MongoDB → SmartPark relay → cached localStorage data so the UI never goes blank |
| **30-day data retention** | MongoDB TTL index auto-purges readings older than 30 days |

### Sensor Parameters Tracked

| Parameter | Safe Range | Source |
|---|---|---|
| pH | 6.5 – 8.5 | Hardware sensor |
| TDS (Total Dissolved Solids) | < 500 ppm | Hardware sensor |
| Temperature | — | Hardware sensor |
| Turbidity | < 5 NTU | Server-generated (random 1–10 NTU until hardware wired) |
| Conductivity | < 600 μS/cm | Derived: `TDS × 2` |
| RSSI / SNR / Spreading Factor | — | LoRa RF metadata from TTN |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS v4, Radix UI primitives |
| Charts | Recharts |
| Icons | Lucide React |
| Theming | next-themes (dark / light) |
| Database | MongoDB via Mongoose v9 |
| IoT Network | The Things Network (TTN) — LoRaWAN |
| Hardware | ESP32 + LoRa SX1276 |
| AI Engine (primary) | Python FastAPI + Random Forest (scikit-learn, 3,276 samples) |
| AI Engine (fallback) | TypeScript threshold-based engine (built-in) |
| Deployment | Vercel (frontend), Railway (Python model server) |

---

## Project Structure

```
hydro-monitor-app/
├── app/
│   ├── page.tsx              # Main dashboard — polls sensor data, runs predictions
│   ├── layout.tsx            # Root layout — Navbar, Footer, ThemeProvider
│   ├── about/page.tsx        # Project info, features, team
│   ├── contact/page.tsx      # Contact page
│   ├── docs/page.tsx         # Developer docs (TTN decoder, webhook, API, hardware)
│   └── api/
│       ├── webhook/route.ts      # POST — receives TTN uplink, saves to MongoDB
│       ├── sensor-data/route.ts  # GET  — returns readings (MongoDB → relay → empty)
│       ├── predict/route.ts      # POST — runs water quality AI prediction
│       └── db-test/route.ts      # GET  — MongoDB connectivity health check
├── components/
│   ├── device-card.tsx           # Per-device card (readings + prediction + chart)
│   ├── hero-section.tsx          # Dashboard hero banner
│   ├── model-simulator.tsx       # Interactive AI model tester with sliders
│   ├── sensor-history-chart.tsx  # Recharts line chart for reading history
│   ├── stats-bar.tsx             # Summary stats (total/safe/alert devices, readings)
│   ├── navbar.tsx / footer.tsx
│   └── ui/                       # Radix-based shadcn components
├── lib/
│   ├── db.ts                 # Mongoose connection singleton (globalThis cache)
│   ├── predict.ts            # TypeScript AI fallback engine
│   ├── store.ts              # In-memory reading store (dev/legacy)
│   ├── local-history.ts      # localStorage history (up to 500 readings)
│   └── utils.ts              # cn() Tailwind class helper
├── models/
│   ├── Reading.ts            # Mongoose model — one doc per TTN uplink
│   └── Device.ts             # Mongoose model — one doc per IoT device (upserted)
└── types/index.ts            # SensorReading, WaterPrediction, DeviceReading interfaces
```

---

## Backend Architecture

### Data Flow

```
IoT Node (ESP32 + LoRa)
    │  LoRa radio packet (pH + TDS + temperature in 6 bytes)
    ▼
The Things Network (TTN)
    │  TTN uplink decoder (JavaScript payload formatter)
    │  → decoded_payload: { temperature, tds, ph }
    ▼
POST /api/webhook  (Next.js API route)
    ├── Parses decoded payload OR decodes raw Base64 bytes as fallback
    ├── Computes turbidity (random 1–10 NTU) and conductivity (TDS × 2)
    ├── Upserts Reading document in MongoDB (idempotent on readingId UUID)
    └── Upserts Device document (updates last-seen, latest values, increments totalReadings)
    
Frontend (browser, polling every 30 s)
    │
    ├── GET /api/sensor-data
    │       ├── 1st: MongoDB → returns up to 500 readings (newest first)
    │       ├── 2nd: SmartPark relay (RELAY_URL) if MongoDB is empty
    │       └── 3rd: empty response
    │
    ├── POST /api/predict  (per device, using latest reading)
    │       ├── 1st: Python FastAPI at FASTAPI_URL (8-second timeout)
    │       └── 2nd: TypeScript engine (threshold-based, always available)
    │
    └── localStorage (jalrakshak_history) — caches up to 500 readings for history charts
```

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/webhook` | TTN uplink receiver. Optionally validated via `X-TTN-Secret` header. Parses decoded payload or raw Base64 bytes. Writes to MongoDB. |
| `GET` | `/api/sensor-data?limit=N` | Returns sensor readings. Max `limit` is 500. Priority: MongoDB → relay → empty. Response includes `source`, `count`, `totalReadings`, `lastDataAt`. |
| `POST` | `/api/predict` | Accepts `{ ph, tds, conductivity, turbidity }`. Returns `WaterPrediction` with `engine: "railway"` or `"typescript"`. |
| `GET` | `/api/db-test` | Returns `{ db, devices, readings }` — quick connectivity check. **Remove before production.** |

All `/api/*` routes expose CORS headers (`Access-Control-Allow-Origin: *`) to support the TTN webhook and the SmartPark relay.

### MongoDB Models

**`readings` collection** — one document per TTN uplink  
Fields: `readingId` (UUID, unique), `deviceId`, `deviceName`, `timestamp`, `receivedAt`, `temperature`, `ph`, `tds`, `turbidity`, `conductivity`, `rssi`, `snr`, `spreadingFactor`  
TTL index on `receivedAt` — auto-deleted after **30 days**.

**`devices` collection** — one document per IoT device  
Fields: `deviceId` (unique), `deviceName`, `lastSeen`, `lastPh/Tds/Temperature/Turbidity/Conductivity`, `rssi`, `snr`, `spreadingFactor`, `totalReadings` (counter), `createdAt`, `updatedAt`  
Upserted (not inserted) on every incoming webhook.

### AI Prediction Engine

The TypeScript fallback engine (`lib/predict.ts`) mirrors the Python Random Forest logic:

- **Safety score** (0–100): starts at 100, deducts points for out-of-range parameters
- **Risk level**: Low (≥80), Moderate (≥50), High (<50)
- **Possible causes**: contextual strings for each violated threshold
- **Recommended actions**: remediation advice per threshold violation
- **Future risk**: ring buffer of last 5 readings detects rising turbidity or TDS trends

The primary engine is a **Random Forest classifier** (scikit-learn) trained on `water_potability.csv` (3,276 samples), served via FastAPI in the `JALRASHAK-AI-MODEL/` service.

---

## Environment Variables

Create a `.env.local` file in the `hydro-monitor-app/` directory:

```env
# ── Required ──────────────────────────────────────────────────────────────
# MongoDB connection URI (MongoDB Atlas or self-hosted)
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# ── Optional ──────────────────────────────────────────────────────────────
# Shared secret validated against the X-TTN-Secret header on /api/webhook
# Leave unset to accept all incoming webhooks (use only during development)
TTN_WEBHOOK_SECRET=your_secret_here

# URL of the Python FastAPI prediction server (Railway / Azure / local)
# If unset, the TypeScript fallback engine is used automatically
FASTAPI_URL=https://your-model-server.railway.app

# TTN relay URL for seeding the dashboard when MongoDB is empty
# Default: https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
RELAY_URL=https://iot-smart-park.vercel.app/api/ttn/jalrakshak-ai
```

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | MongoDB connection string; app throws on startup if missing |
| `TTN_WEBHOOK_SECRET` | No | `null` (no auth) | Validates `X-TTN-Secret` header on webhook route |
| `FASTAPI_URL` | No | `null` | Python model server; falls back to TypeScript engine if absent or unreachable |
| `RELAY_URL` | No | SmartPark relay URL | Relay used to seed readings when MongoDB is empty |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (or local MongoDB instance)
- (Optional) A running instance of the `JALRASHAK-AI-MODEL` Python server

### Installation

```bash
cd hydro-monitor-app
npm install
```

### Development

```bash
# Create .env.local and fill in DATABASE_URL (see above)
cp .env.local.example .env.local   # or create manually

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build & Start (Production)

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## TTN Webhook Setup

1. In your TTN application, go to **Integrations → Webhooks → Add webhook**.
2. Set the **Base URL** to `https://<your-domain>/api/webhook`.
3. Enable **Uplink message** events.
4. (Optional) Add a header `X-TTN-Secret: <value>` and set `TTN_WEBHOOK_SECRET` to the same value.

**TTN Payload Formatter** — add this under *Payload Formatters → Uplink → Custom JavaScript*:

```js
function decodeUplink(input) {
  var temp = (input.bytes[0] << 8 | input.bytes[1]) / 10;  // °C
  var tds  = (input.bytes[2] << 8 | input.bytes[3]);        // ppm
  var ph   = (input.bytes[4] << 8 | input.bytes[5]) / 100; // 0–14
  return { data: { temperature: temp, tds: tds, ph: ph } };
}
```

For local development without a live TTN device, the dashboard seeds from the SmartPark relay automatically.

---

## Pages

| Route | Description |
|---|---|
| `/` | Live dashboard — device cards, stats bar, auto-refresh, model simulator |
| `/about` | Project overview, feature list, hardware details, team info |
| `/docs` | Developer documentation — TTN decoder, webhook setup, API reference, hardware wiring |
| `/contact` | Contact information |

---

## Hardware

- **Microcontroller**: ESP32
- **Radio**: LoRa SX1276 (LoRaWAN, long-range low-power)
- **Sensors**: pH probe, TDS probe, temperature sensor
- **Power**: Battery-operated; transmits once per minute
- **Coverage**: Works in areas without cellular connectivity (rural / agricultural)
