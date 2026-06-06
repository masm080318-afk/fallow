import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Target, Droplets, Users, TrendingUp } from "lucide-react";

export default function MissionPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo-icon.png" alt="Soilify Labs" width={36} height={36} />
          <span className="text-base font-bold tracking-tight text-gradient">Soilify Labs</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium" style={{ color: "var(--muted)" }}>
          <Link href="/about" className="hover:text-[var(--green)] transition-colors">About</Link>
          <Link href="/mission" className="text-[var(--green)] font-semibold">Our Mission</Link>
          <Link href="/contact" className="hover:text-[var(--green)] transition-colors">Contact</Link>
        </nav>
        <Link href="/contact" className="btn-primary text-sm !min-h-0 py-2 px-4">Pre-order</Link>
      </header>

      {/* Hero */}
      <section className="bg-white px-6 py-20 text-center border-b border-[var(--border)]">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-8 hover:text-[var(--green)] transition-colors" style={{ color: "var(--muted)" }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
          Our <span className="text-gradient">Mission</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
          To make precision soil monitoring accessible to every small farm family —
          not just the ones with large budgets.
        </p>
      </section>

      {/* Mission statement */}
      <section className="px-6 py-20 bg-white border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Target size={26} style={{ color: "var(--green)" }} />
          </div>
          <blockquote className="text-2xl sm:text-3xl font-bold leading-snug mb-6">
            &ldquo;Agriculture feeds the world.<br />
            <span className="text-gradient">Small farms feed their communities.</span><br />
            They deserve better tools.&rdquo;
          </blockquote>
          <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
            We believe that technology should reduce inequality in farming — not increase it.
            The same data insights available to large commercial operations should be
            available to a family tending a few acres.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 py-20" style={{ background: "var(--background)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-12" style={{ color: "var(--green)" }}>
            What we stand for
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: Droplets,
                title: "Affordability",
                desc: "Our sensor kits use off-the-shelf hardware that costs around $20. The software is free. Precision agriculture shouldn't require a loan.",
              },
              {
                icon: Users,
                title: "Accessibility",
                desc: "Set up in one afternoon with no engineering background. If you can follow a recipe, you can set up Soilify Labs.",
              },
              {
                icon: TrendingUp,
                title: "Impact",
                desc: "Better watering decisions mean less water wasted, healthier crops, and more food from the same land — for the farmer and their community.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(92,158,42,0.1)" }}>
                  <Icon size={20} style={{ color: "var(--green)" }} />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The problem in numbers */}
      <section className="px-6 py-20 bg-white border-t border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold tracking-widest uppercase mb-12" style={{ color: "var(--green)" }}>
            The problem we&apos;re solving
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: "$10,000+",  label: "Cost of commercial precision irrigation systems" },
              { stat: "~90%",      label: "Of US farms are small family operations" },
              { stat: "~$20",      label: "Cost of a Soilify Labs sensor kit" },
            ].map(({ stat, label }) => (
              <div key={stat} className="card">
                <div className="text-4xl font-black mb-2 text-gradient">{stat}</div>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center" style={{ background: "var(--background)" }}>
        <h2 className="text-2xl font-bold mb-3">Join the movement</h2>
        <p className="text-sm mb-7" style={{ color: "var(--muted)" }}>
          Be among the first small farms to use Soilify Labs.
        </p>
        <Link href="/contact" className="btn-primary px-8 py-3.5">Pre-order your kit</Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-5 bg-white text-center">
        <p className="text-xs" style={{ color: "var(--muted)" }}>© 2025 Soilify Labs · Where Agriculture Meets Innovation</p>
      </footer>
    </main>
  );
}
