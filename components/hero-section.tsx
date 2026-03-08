import { Droplets, Cpu, Satellite } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-card/50 px-6 py-10 sm:px-10">
      {/* Background decorative blur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/5 blur-2xl"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          {/* Hackathon badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Cpu className="h-3 w-3" />
            Microsoft AI Unlocked Hackathon · AI for India Track
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            <span className="gradient-text">JalRakshak.AI</span>
            <br />
            <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
              Water Quality Intelligence
            </span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Real-time IoT water quality monitoring via LoRaWAN sensors, powered by an AI model trained on 3,276 water samples. Protecting India&apos;s water resources — one reading at a time.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { icon: Droplets, text: "Live Sensor Data" },
              { icon: Satellite, text: "LoRaWAN + TTN" },
              { icon: Cpu, text: "AI Predictions" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                <Icon className="h-3 w-3 text-primary" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative sensor icon */}
        <div className="hidden md:flex h-32 w-32 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 ring-4 ring-primary/5 lg:h-40 lg:w-40">
          <Droplets className="h-14 w-14 text-primary/70 lg:h-18 lg:w-18" />
        </div>
      </div>
    </div>
  );
}
