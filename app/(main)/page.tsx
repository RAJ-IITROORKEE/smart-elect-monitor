import { HeroSection } from "@/components/hero-section";
import { LiveMonitor } from "@/components/live-monitor";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <HeroSection />

      <section className="mt-8">
        <LiveMonitor deviceId="node_01" />
      </section>
    </div>
  );
}
