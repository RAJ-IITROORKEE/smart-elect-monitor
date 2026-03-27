# VoltEdge - Smart Electricity Monitor

Frontend-only Next.js project adapted from a reference structure for an IoT electricity monitoring product.

## What this project contains

- Marketing/landing pages with monotheme blue visual system
- Responsive admin panel layout using shadcn/ui sidebar components
- Placeholder dashboard modules for:
  - Energy nodes
  - Realtime analysis
  - Contacts
  - Notifications
  - Documentation
- Light and dark mode support
- Global top loader
- Custom 404, route error, and global error pages

## Project context

- Domain: IoT-based electricity monitoring and control automation
- Use cases: Hostels, institutions, hotels
- Hardware direction: ESP32 standard dev boards + Wi-Fi communication
- Scale path: LoRaWAN in later phase for optimized scalability

## Team (current)

- Sagar Barua (ECE, 3rd Year B.Tech, IIT Roorkee)
- One member placeholder (to be added)

## Tech stack (planned + current UI)

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- MongoDB (planned)
- Prisma ORM (planned)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Notes

- This repository is intentionally frontend-only right now.
- Backend APIs, database models, firmware generators, and detailed docs content are placeholders for later implementation.
