import Link from "next/link";
import { Sprout, LineChart, Bell, Droplets } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Sprout className="text-green" size={24} />
          <span className="text-xl font-bold tracking-tight">Fallow</span>
        </div>
        <Link href="/login" className="btn-secondary text-sm">
          Sign in
        </Link>
      </header>

      <section className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
        <Sprout className="text-green mb-6" size={56} />
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Know your soil. Save your water.
        </h1>
        <p className="text-lg text-muted mb-8 max-w-xl">
          Fallow turns a $20 sensor into a connected farmhand. Get real-time
          moisture readings, SMS alerts, and AI-powered irrigation advice.
        </p>
        <Link href="/login" className="btn-primary text-base">
          Get started free
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full">
          <div className="card text-left">
            <Droplets className="text-green mb-3" size={24} />
            <h3 className="font-semibold mb-1">Live moisture</h3>
            <p className="text-sm text-muted">
              Sub-second updates from your field.
            </p>
          </div>
          <div className="card text-left">
            <LineChart className="text-green mb-3" size={24} />
            <h3 className="font-semibold mb-1">AI guidance</h3>
            <p className="text-sm text-muted">
              Claude-powered watering recommendations.
            </p>
          </div>
          <div className="card text-left">
            <Bell className="text-green mb-3" size={24} />
            <h3 className="font-semibold mb-1">SMS alerts</h3>
            <p className="text-sm text-muted">
              Texts before crops stress, not after.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
