import Link from "next/link";
import Image from "next/image";
import "./landing.css";
import CountUp from "@/components/landing/CountUp";
import LiveDashboard from "@/components/landing/LiveDashboard";
import Reveal from "@/components/landing/Reveal";

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h9M8 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3.5 3.5L13 4.5" stroke="#2E6B1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Droplet = ({ size = 16, fill = "#2E6B1F" }: { size?: number; fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5s5 4.5 5 8.5a5 5 0 01-10 0c0-4 5-8.5 5-8.5z" fill={fill} />
  </svg>
);

export default function Home() {
  return (
    <main className="lp">
      {/* ══ NAV ══ */}
      <header className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <Link href="/" className="lp-brand">
            <Image src="/logo-icon.png" alt="Soilify Labs" width={30} height={30} style={{ borderRadius: 7, display: "block" }} />
            <span>Soilify Labs</span>
          </Link>
          <nav className="lp-navlinks">
            <a href="#how">How it works</a>
            <a href="#kit">The kit</a>
            <a href="#mission">Mission</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/login" className="lp-btn-ghost">Sign in</Link>
            <Link href="/contact" className="lp-btn-solid">Pre-order</Link>
          </div>
        </div>
      </header>

      <div id="top" />

      {/* ══ HERO ══ */}
      <section className="lp-wrap lp-hero">
        <div>
          <div className="lp-pill">
            <span className="lp-dot" />
            Precision farming for the rest of us
          </div>

          <h1 className="lp-h1">
            Grow smarter<br />from the{" "}
            <span className="lp-underline">
              soil up
              <svg width="100%" height="14" viewBox="0 0 200 14" preserveAspectRatio="none">
                <path d="M2 9 Q50 2 100 8 T198 6" fill="none" stroke="#E4B441" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>.
          </h1>

          <p className="lp-lede">
            The same precision irrigation intelligence big farms pay <strong>$10,000+</strong> for,
            delivered as a friendly little sensor you stake in the dirt. Live moisture, AI crop
            checkups, and text alerts before your plants ever feel stress.
          </p>

          <div className="lp-cta-row">
            <Link href="/contact" className="lp-cta">Pre-order your kit <Arrow /></Link>
            <a href="#how" className="lp-cta-2">See how it works</a>
          </div>

          <div className="lp-ticks">
            <span className="lp-tick"><Check />Software free forever</span>
            <span className="lp-tick"><Check />Set up in 5 minutes</span>
          </div>
        </div>

        {/* Illustrated scene */}
        <div className="lp-scene">
          <svg viewBox="0 0 400 368" width="100%" height="100%" style={{ display: "block" }} preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="lp-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#DCEBF2" />
                <stop offset="1" stopColor="#F1EFE0" />
              </linearGradient>
              <linearGradient id="lp-soil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#B8542F" />
                <stop offset="1" stopColor="#7A3B24" />
              </linearGradient>
            </defs>
            <rect width="400" height="368" fill="url(#lp-sky)" />

            {/* sun */}
            <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: "translate(318px, 62px)" }}>
              <g style={{ animation: "so-rayspin 40s linear infinite", transformBox: "fill-box", transformOrigin: "center" }}>
                <g stroke="#E4B441" strokeWidth="4" strokeLinecap="round">
                  <line x1="0" y1="-34" x2="0" y2="-24" /><line x1="0" y1="24" x2="0" y2="34" />
                  <line x1="-34" y1="0" x2="-24" y2="0" /><line x1="24" y1="0" x2="34" y2="0" />
                  <line x1="-24" y1="-24" x2="-17" y2="-17" /><line x1="17" y1="17" x2="24" y2="24" />
                  <line x1="24" y1="-24" x2="17" y2="-17" /><line x1="-17" y1="17" x2="-24" y2="24" />
                </g>
              </g>
              <circle r="18" fill="#E4B441" />
            </g>

            {/* clouds */}
            <g fill="#FFFDF7" opacity="0.92" style={{ animation: "so-drift 13s ease-in-out infinite" }}>
              <ellipse cx="86" cy="58" rx="26" ry="15" /><ellipse cx="108" cy="50" rx="20" ry="14" /><ellipse cx="64" cy="52" rx="17" ry="12" />
            </g>
            <g fill="#FFFDF7" opacity="0.7" style={{ animation: "so-drift 17s ease-in-out infinite reverse" }}>
              <ellipse cx="210" cy="40" rx="20" ry="11" /><ellipse cx="228" cy="34" rx="15" ry="10" />
            </g>

            {/* rain */}
            <g fill="#7FA3C9">
              <path d="M84 76 q-3 5 0 8 q3 -3 0 -8" style={{ animation: "so-fall 2.4s ease-in 0s infinite" }} />
              <path d="M96 76 q-3 5 0 8 q3 -3 0 -8" style={{ animation: "so-fall 2.4s ease-in .8s infinite" }} />
              <path d="M74 76 q-3 5 0 8 q3 -3 0 -8" style={{ animation: "so-fall 2.4s ease-in 1.5s infinite" }} />
            </g>

            {/* ground */}
            <path d="M0 236 Q120 218 220 232 Q320 244 400 230 L400 368 L0 368 Z" fill="url(#lp-soil)" />
            <path d="M0 236 Q120 218 220 232 Q320 244 400 230 L400 250 Q300 262 200 250 Q100 240 0 256 Z" fill="#C96B3C" opacity="0.65" />
            <g fill="#5E2C1A" opacity="0.5">
              <circle cx="60" cy="300" r="3" /><circle cx="130" cy="330" r="2.4" /><circle cx="250" cy="310" r="3" />
              <circle cx="330" cy="336" r="2.6" /><circle cx="180" cy="345" r="2.4" /><circle cx="90" cy="345" r="2" />
            </g>

            {/* plant */}
            <g style={{ transformBox: "fill-box", transformOrigin: "150px 250px", animation: "so-swaySoft 5s ease-in-out infinite" }}>
              <path d="M150 250 Q147 210 150 176" stroke="#3F7D2A" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M150 210 Q124 200 112 178 Q140 176 150 200 Z" fill="#4C9A3A" />
              <path d="M150 196 Q176 186 188 164 Q160 162 150 186 Z" fill="#3F7D2A" />
              <path d="M150 184 Q130 172 124 150 Q146 152 150 176 Z" fill="#4C9A3A" />
              <circle cx="150" cy="149" r="10.5" fill="#E4B441" />
              <circle cx="146.5" cy="145.5" r="3.2" fill="#F2D488" />
              <path d="M150 139 Q145 133 147 127 Q152 131 150 139 Z" fill="#4C9A3A" />
            </g>

            {/* roots */}
            <g stroke="#5E2C1A" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round">
              <path d="M150 250 q-10 22 -22 34" /><path d="M150 250 q8 26 20 30" /><path d="M150 250 q-2 30 -2 40" />
            </g>

            {/* sensor node */}
            <g>
              <line x1="270" y1="252" x2="270" y2="322" stroke="#9AA089" strokeWidth="4" strokeLinecap="round" />
              <g style={{ animation: "so-float 4s ease-in-out infinite" }}>
                <rect x="252" y="214" width="36" height="46" rx="9" fill="#2E6B1F" />
                <rect x="252" y="214" width="36" height="46" rx="9" fill="none" stroke="#1C4713" strokeWidth="1.5" />
                <circle cx="270" cy="228" r="4" fill="#8FE06B" style={{ animation: "so-blink 1.6s ease-in-out infinite" }} />
                <rect x="260" y="240" width="20" height="3.5" rx="1.75" fill="#8FE06B" opacity="0.8" />
                <rect x="260" y="248" width="14" height="3.5" rx="1.75" fill="#8FE06B" opacity="0.5" />
              </g>
              <g>
                <circle cx="270" cy="210" r="12" fill="none" stroke="#4C9A3A" strokeWidth="2.5"
                  style={{ transformBox: "fill-box", transformOrigin: "270px 210px", animation: "so-ring 2.6s ease-out infinite" }} />
                <circle cx="270" cy="210" r="12" fill="none" stroke="#4C9A3A" strokeWidth="2.5"
                  style={{ transformBox: "fill-box", transformOrigin: "270px 210px", animation: "so-ring 2.6s ease-out 1.3s infinite" }} />
              </g>
            </g>
          </svg>

          {/* floating chips */}
          <div className="lp-chip" style={{ top: 18, left: 18, padding: "10px 13px", animation: "so-floatSlow 6s ease-in-out infinite" }}>
            <div className="lp-chip-label">Soil moisture</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <CountUp to={62} style={{ fontFamily: "var(--font-bricolage), sans-serif", fontWeight: 700, fontSize: 26, color: "#2E6B1F" }} />
              <span style={{ fontWeight: 700, color: "#2E6B1F", fontSize: 16 }}>%</span>
            </div>
          </div>
          <div className="lp-chip" style={{ bottom: 20, right: 18, padding: "9px 12px", display: "flex", alignItems: "center", gap: 8, animation: "so-floatSlow 6s ease-in-out .8s infinite" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: "#E9EFE4", display: "grid", placeItems: "center" }}>
              <Droplet size={15} />
            </span>
            <div>
              <div style={{ fontSize: 10.5, color: "#5C6156", fontWeight: 600 }}>Healthy</div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#211E17" }}>No action needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section className="lp-wrap" style={{ marginTop: 24 }}>
        <div className="lp-stats">
          <div className="lp-stat">
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span className="lp-stat-num" style={{ color: "#E4B441" }}>$</span>
              <CountUp to={105} className="lp-stat-num" style={{ color: "#E4B441" }} />
            </div>
            <div className="lp-stat-cap">Complete kit price</div>
          </div>
          <div className="lp-stat">
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <CountUp to={15} className="lp-stat-num" style={{ color: "#fff" }} />
              <span className="lp-stat-num" style={{ fontSize: 18, color: "#fff" }}>min</span>
            </div>
            <div className="lp-stat-cap">Sensor read interval</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num" style={{ color: "#fff" }}>Free</div>
            <div className="lp-stat-cap">Software, always</div>
          </div>
          <div className="lp-stat">
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <CountUp to={500} className="lp-stat-num" style={{ color: "#4C9A3A" }} />
              <span className="lp-stat-num" style={{ fontSize: 26, color: "#4C9A3A" }}>×</span>
            </div>
            <div className="lp-stat-cap">Cheaper than commercial</div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" className="lp-wrap" style={{ padding: "90px 28px 40px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 54 }}>
            <p className="lp-eyebrow">How it works</p>
            <h2 className="lp-h2">From dirt to dashboard<br />in four hops</h2>
            <p className="lp-sub" style={{ maxWidth: 520 }}>
              Your reading leaves the soil and lands on your phone, automatically, every 15 minutes.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="lp-panel" style={{ padding: "46px 30px" }}>
            <svg viewBox="0 0 920 220" width="100%" style={{ display: "block", overflow: "visible" }}>
              <path d="M120 110 H340 M460 110 H680 M800 110 H820" fill="none" stroke="#DCD6C6" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
              <path d="M120 110 H800" fill="none" stroke="#4C9A3A" strokeWidth="3" strokeDasharray="10 14" strokeLinecap="round" opacity="0.9" style={{ animation: "so-flow 3s linear infinite" }} />
              <circle r="6" fill="#2E6B1F" style={{ offsetPath: "path('M120 110 H800')", animation: "so-packet 3.2s linear infinite" }} />
              <circle r="6" fill="#E4B441" style={{ offsetPath: "path('M120 110 H800')", animation: "so-packet 3.2s linear 1.6s infinite" }} />

              <g transform="translate(60,50)">
                <circle cx="0" cy="60" r="52" fill="#E9EFE4" />
                <line x1="0" y1="68" x2="0" y2="96" stroke="#9AA089" strokeWidth="4" strokeLinecap="round" />
                <rect x="-14" y="34" width="28" height="40" rx="7" fill="#2E6B1F" />
                <circle cx="0" cy="45" r="3.4" fill="#8FE06B" style={{ animation: "so-blink 1.6s infinite" }} />
                <rect x="-8" y="55" width="16" height="3" rx="1.5" fill="#8FE06B" opacity=".7" />
              </g>
              <g transform="translate(400,50)">
                <circle cx="0" cy="60" r="52" fill="#FBF3DE" />
                <rect x="-24" y="46" width="48" height="30" rx="7" fill="#211E17" />
                <line x1="-12" y1="46" x2="-16" y2="30" stroke="#211E17" strokeWidth="3" strokeLinecap="round" />
                <line x1="12" y1="46" x2="16" y2="30" stroke="#211E17" strokeWidth="3" strokeLinecap="round" />
                <circle cx="-16" cy="28" r="3" fill="#E4B441" /><circle cx="16" cy="28" r="3" fill="#E4B441" />
                <circle cx="-10" cy="61" r="2.6" fill="#4C9A3A" style={{ animation: "so-blink 1.2s infinite" }} />
                <circle cx="0" cy="61" r="2.6" fill="#4C9A3A" style={{ animation: "so-blink 1.2s .3s infinite" }} />
                <circle cx="10" cy="61" r="2.6" fill="#4C9A3A" style={{ animation: "so-blink 1.2s .6s infinite" }} />
              </g>
              <g transform="translate(680,50)">
                <circle cx="0" cy="60" r="52" fill="#E4EEF4" />
                <g fill="#3E5F8A">
                  <ellipse cx="-12" cy="62" rx="20" ry="14" /><ellipse cx="10" cy="56" rx="16" ry="12" />
                  <ellipse cx="14" cy="66" rx="14" ry="10" /><rect x="-22" y="62" width="44" height="12" rx="6" />
                </g>
                <path d="M-4 54 l-6 10 h6 l-4 10" fill="none" stroke="#E4B441" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <g transform="translate(860,50)">
                <circle cx="0" cy="60" r="52" fill="#E9EFE4" />
                <rect x="-17" y="30" width="34" height="60" rx="8" fill="#211E17" />
                <rect x="-13" y="36" width="26" height="48" rx="4" fill="#F7F3EA" />
                <polyline points="-9,68 -3,60 3,64 9,50" fill="none" stroke="#2E6B1F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="0" cy="88" r="1.6" fill="#F7F3EA" />
              </g>
            </svg>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 12, textAlign: "center" }}>
              {[
                ["1 · Sensor", "Reads soil moisture in the ground"],
                ["2 · Gateway", "Relays readings over WiFi"],
                ["3 · Cloud", "Crunches ET₀ irrigation math"],
                ["4 · You", "Live charts + text alerts"],
              ].map(([t, d]) => (
                <div key={t}>
                  <div className="display" style={{ fontSize: 16 }}>{t}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ LIVE DASHBOARD ══ */}
      <section className="lp-wrap" style={{ padding: "70px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 44, alignItems: "center" }} className="lp-two">
          <Reveal>
            <p className="lp-eyebrow">Live data, always on</p>
            <h2 className="lp-h2-sm">Watch your soil breathe in real time</h2>
            <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.55, margin: "0 0 24px" }}>
              Moisture streams in every 15 minutes and animates across your dashboard. See the daily
              dry-down, the rebound after watering, and the exact moment to act.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [<Droplet key="d" />, "Live soil moisture gauge", "A glance tells you dry, ideal, or soaked."],
                [
                  <svg key="c" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 11l3-4 3 2 4-6" stroke="#2E6B1F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>,
                  "Trend charts", "Day, week, and month at a glance.",
                ],
                [
                  <svg key="a" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v4M8 11.5v.5M3 8H2m12 0h-1M4.5 4.5l-.7-.7m8.4.7l.7-.7" stroke="#2E6B1F" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="8" cy="8" r="2.5" fill="#2E6B1F" />
                  </svg>,
                  "SMS alerts", "A text lands before your crops feel stress.",
                ],
              ].map(([icon, title, desc], i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span className="lp-ico-sm">{icon as React.ReactNode}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{title as string}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>{desc as string}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <LiveDashboard />
          </Reveal>
        </div>
      </section>

      {/* ══ THE KIT ══ */}
      <section id="kit" className="lp-dark" style={{ padding: "90px 28px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p className="lp-eyebrow" style={{ color: "#E4B441" }}>What&apos;s in the box</p>
              <h2 className="lp-h2" style={{ color: "#fff", margin: 0 }}>Two friendly little devices</h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="lp-two">
            <Reveal delay={80}>
              <div className="lp-kitcard">
                <div className="lp-price">
                  <div className="lp-price-num">$75</div>
                  <div className="lp-price-cap">per sensor node</div>
                </div>
                <div style={{ height: 190, display: "grid", placeItems: "center" }}>
                  <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "so-floatSlow 7s ease-in-out infinite" }}>
                    <line x1="100" y1="130" x2="100" y2="182" stroke="#9AA089" strokeWidth="6" strokeLinecap="round" />
                    <path d="M92 182 l8 12 l8 -12 Z" fill="#9AA089" />
                    <rect x="72" y="52" width="56" height="82" rx="14" fill="#2E6B1F" />
                    <rect x="72" y="52" width="56" height="82" rx="14" fill="none" stroke="#4C9A3A" strokeWidth="2" />
                    <circle cx="100" cy="72" r="6" fill="#8FE06B" style={{ animation: "so-blink 1.6s infinite" }} />
                    <rect x="86" y="90" width="28" height="5" rx="2.5" fill="#8FE06B" opacity=".85" />
                    <rect x="86" y="102" width="20" height="5" rx="2.5" fill="#8FE06B" opacity=".55" />
                    <rect x="86" y="114" width="24" height="5" rx="2.5" fill="#8FE06B" opacity=".4" />
                    <circle cx="100" cy="48" r="10" fill="none" stroke="#8FE06B" strokeWidth="2.5"
                      style={{ transformBox: "fill-box", transformOrigin: "100px 48px", animation: "so-ring 2.4s ease-out infinite" }} />
                  </svg>
                </div>
                <h3>Sensor node</h3>
                <p>Stake it in the soil. A capacitive probe reads moisture 0–100%, and the onboard ESP32 beams it to your gateway. Weatherproof and solar-friendly.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Capacitive probe", "ESP32", "Weatherproof"].map((t) => (
                    <span key={t} className="lp-tag lp-tag-green">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="lp-kitcard">
                <div className="lp-price">
                  <div className="lp-price-num">$30</div>
                  <div className="lp-price-cap">per gateway</div>
                </div>
                <div style={{ height: 190, display: "grid", placeItems: "center" }}>
                  <svg viewBox="0 0 200 200" width="180" height="180" style={{ animation: "so-floatSlow 7s ease-in-out .6s infinite" }}>
                    <rect x="56" y="96" width="88" height="54" rx="13" fill="#211E17" stroke="#3E5F8A" strokeWidth="2" />
                    <line x1="80" y1="96" x2="72" y2="60" stroke="#7FA3C9" strokeWidth="4" strokeLinecap="round" />
                    <line x1="120" y1="96" x2="128" y2="60" stroke="#7FA3C9" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="72" cy="56" r="5" fill="#E4B441" /><circle cx="128" cy="56" r="5" fill="#E4B441" />
                    <circle cx="80" cy="124" r="4" fill="#4C9A3A" style={{ animation: "so-blink 1.2s infinite" }} />
                    <circle cx="100" cy="124" r="4" fill="#4C9A3A" style={{ animation: "so-blink 1.2s .3s infinite" }} />
                    <circle cx="120" cy="124" r="4" fill="#7FA3C9" style={{ animation: "so-blink 1.2s .6s infinite" }} />
                    <circle cx="100" cy="40" r="14" fill="none" stroke="#7FA3C9" strokeWidth="2.5"
                      style={{ transformBox: "fill-box", transformOrigin: "100px 40px", animation: "so-ring 2.6s ease-out infinite" }} />
                    <circle cx="100" cy="40" r="14" fill="none" stroke="#7FA3C9" strokeWidth="2.5"
                      style={{ transformBox: "fill-box", transformOrigin: "100px 40px", animation: "so-ring 2.6s ease-out 1.3s infinite" }} />
                  </svg>
                </div>
                <h3>WiFi gateway</h3>
                <p>Plug it in near power. It listens to every node on your land and relays their readings to the cloud over your WiFi. One gateway covers a whole property.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Covers many nodes", "Plug & play"].map((t) => (
                    <span key={t} className="lp-tag lp-tag-blue">{t}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="lp-total">
              <div className="display" style={{ display: "flex", alignItems: "center", gap: 16, color: "#fff", fontSize: 22, flexWrap: "wrap" }}>
                <span>1 Gateway <span style={{ color: "rgba(255,255,255,.7)", fontSize: 16 }}>$30</span></span>
                <span style={{ opacity: .7 }}>+</span>
                <span>1 Node <span style={{ color: "rgba(255,255,255,.7)", fontSize: 16 }}>$75</span></span>
                <span style={{ opacity: .7 }}>=</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "right", color: "#fff" }}>
                  <div style={{ fontSize: 12.5, opacity: .8 }}>Complete starter kit</div>
                  <div className="display" style={{ fontSize: 38, lineHeight: 1 }}>$105</div>
                </div>
                <Link href="/contact" style={{ fontSize: 15, fontWeight: 700, color: "#2E6B1F", background: "#fff", padding: "13px 22px", borderRadius: 11, whiteSpace: "nowrap" }}>
                  Pre-order kit →
                </Link>
              </div>
            </div>
          </Reveal>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,.45)", fontSize: 13, margin: "16px 0 0" }}>
            Add extra nodes ($75 each) to cover more fields. One gateway handles them all.
          </p>
        </div>
      </section>

      {/* ══ ET₀ MATH ══ */}
      <section className="lp-wrap" style={{ padding: "90px 28px" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p className="lp-eyebrow">The science, made simple</p>
            <h2 className="lp-h2-sm">The $10,000 irrigation formula,<br />doing the math for you</h2>
            <p className="lp-sub">
              We feed your live soil reading and local weather into the FAO-56 evapotranspiration
              model, then just tell you when to water.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="lp-panel lp-et" style={{ padding: "40px 30px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 18, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  ["#FBF3DE", "#E4B441", "Sun & temp", "from weather API"],
                  ["#E4EEF4", "#7FA3C9", "Wind & humidity", "from weather API"],
                  ["#E9EFE4", "#2E6B1F", "Your soil moisture", "from your node · live"],
                ].map(([bg, ico, title, sub]) => (
                  <div key={title} style={{ display: "flex", alignItems: "center", gap: 11, background: bg, borderRadius: 13, padding: "12px 14px" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, background: ico, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Droplet size={18} fill="#fff" />
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", placeItems: "center" }}>
                <svg width="42" height="24" viewBox="0 0 42 24" fill="none">
                  <path d="M2 12h34M30 5l8 7-8 7" stroke="#C4C2B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 6" style={{ animation: "so-flow 2s linear infinite" }} />
                </svg>
              </div>

              <div style={{ background: "#211E17", borderRadius: 18, padding: "24px 18px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 120%, rgba(76,154,58,.35), transparent 60%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "#8FE06B", textTransform: "uppercase" }}>FAO-56 model</div>
                  <div className="display" style={{ fontSize: 26, color: "#fff", margin: "6px 0 2px" }}>ET<span style={{ fontSize: 16 }}>₀</span></div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.55)", fontStyle: "italic" }}>evapotranspiration</div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
                    <CountUp to={4.2} decimals={1} className="display" style={{ fontSize: 30, color: "#E4B441" }} />
                    <span style={{ color: "#E4B441", fontWeight: 700, fontSize: 14 }}>mm/day</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", placeItems: "center" }}>
                <svg width="42" height="24" viewBox="0 0 42 24" fill="none">
                  <path d="M2 12h34M30 5l8 7-8 7" stroke="#C4C2B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 6" style={{ animation: "so-flow 2s linear .5s infinite" }} />
                </svg>
              </div>

              <div style={{ background: "#E9EFE4", border: "1.5px solid #2E6B1F", borderRadius: 18, padding: "24px 20px", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, margin: "0 auto 12px", borderRadius: 13, background: "#2E6B1F", display: "grid", placeItems: "center" }}>
                  <Droplet size={26} fill="#fff" />
                </div>
                <div className="display" style={{ fontSize: 19, color: "#211E17" }}>Water 0.6″ today</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Best before 6 PM</div>
              </div>
            </div>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", margin: "26px 0 0" }}>
              You never see the equation. You just get the answer, in plain English, on your phone.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="lp-wrap" style={{ padding: "0 28px 70px" }}>
        <Reveal>
          <div style={{ marginBottom: 40 }}>
            <p className="lp-eyebrow">Everything included</p>
            <h2 className="lp-h2-sm" style={{ margin: 0 }}>One kit. Your whole crop, covered.</h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }} className="lp-four">
          {[
            [<Droplet key="1" size={20} />, "Live soil moisture", "Fresh readings every 15 minutes, from field, office, or phone."],
            [
              <svg key="2" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2.5v4M10 15v.5M4 10H2m16 0h-1.5M5 5l-1-1m11 1l1-1" stroke="#2E6B1F" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="10" cy="10" r="3" fill="#2E6B1F" />
              </svg>,
              "SMS alerts", "A text lands the moment soil drops below your threshold.",
            ],
            [
              <svg key="3" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="11" rx="2" stroke="#2E6B1F" strokeWidth="1.7" />
                <circle cx="10" cy="9.5" r="2.6" stroke="#2E6B1F" strokeWidth="1.7" />
                <path d="M7 4l1-1.5h4L13 4" stroke="#2E6B1F" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>,
              "AI crop checkups", "Snap a photo and AI reads it against your soil data for a diagnosis.",
            ],
            [
              <svg key="4" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 14l4-5 3 2 5-7" stroke="#2E6B1F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 17h14" stroke="#2E6B1F" strokeWidth="1.7" strokeLinecap="round" />
              </svg>,
              "Trend charts", "See moisture trends across the day, week, and month.",
            ],
          ].map(([icon, title, desc], i) => (
            <Reveal key={i} delay={40 + i * 60}>
              <div className="lp-feature">
                <span className="lp-ico">{icon as React.ReactNode}</span>
                <h3>{title as string}</h3>
                <p>{desc as string}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ MISSION ══ */}
      <section id="mission" className="lp-wrap" style={{ padding: "0 28px 80px" }}>
        <Reveal>
          <div className="lp-mission">
            <svg viewBox="0 0 60 20" width="200" style={{ position: "absolute", left: -10, bottom: -6, opacity: .35 }}>
              <path d="M0 18 Q15 6 30 14 T60 10" fill="none" stroke="#2E6B1F" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <p className="lp-eyebrow" style={{ marginBottom: 18 }}>Our mission</p>
            <blockquote style={{ margin: "0 auto", maxWidth: 760 }}>
              <p className="display lp-quote">
                Agriculture feeds the world.{" "}
                <span style={{ color: "#2E6B1F" }}>Small farms feed their communities.</span>{" "}
                They deserve the same tools the big operations take for granted.
              </p>
            </blockquote>
            <Link href="/mission" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24, fontWeight: 700, fontSize: 15, color: "#2E6B1F" }}>
              Read our full mission <Arrow />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ══ PRICING / CTA ══ */}
      <section id="pricing" className="lp-wrap" style={{ padding: "0 28px 90px" }}>
        <Reveal>
          <div className="lp-ctabox">
            <svg viewBox="0 0 400 200" width="360" style={{ position: "absolute", right: -30, bottom: -20, opacity: .16 }}>
              <g stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round">
                <path d="M60 180 Q56 130 60 96" /><path d="M60 130 Q30 118 20 92 Q52 90 60 118" /><path d="M60 118 Q90 106 100 80 Q68 78 60 104" />
              </g>
              <circle cx="300" cy="60" r="30" fill="none" stroke="#fff" strokeWidth="4" />
            </svg>

            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center" }} className="lp-two">
              <div>
                <h2 className="display" style={{ fontSize: "clamp(30px, 4.2vw, 50px)", lineHeight: 1.02, color: "#fff", margin: "0 0 16px" }}>
                  Ready to know your soil?
                </h2>
                <p style={{ fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,.8)", margin: "0 0 28px", maxWidth: 440 }}>
                  Reserve a starter kit today. No payment now, we&apos;ll reach out with shipping when
                  kits are ready. Software&apos;s free the moment you plug in.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <Link href="/contact" style={{ fontSize: 16, fontWeight: 700, color: "#211E17", background: "#fff", padding: "16px 30px", borderRadius: 12, boxShadow: "0 14px 30px -12px rgba(0,0,0,.4)" }}>
                    Pre-order your kit →
                  </Link>
                  <a href="#how" style={{ fontSize: 16, fontWeight: 600, color: "#fff", padding: "16px 26px", borderRadius: 12, border: "1px solid rgba(255,255,255,.4)" }}>
                    See how it works
                  </a>
                </div>
              </div>

              <div className="lp-receipt">
                <div className="lp-receipt-row">
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>WiFi gateway ×1</span>
                  <span className="display" style={{ color: "#fff", fontSize: 18 }}>$30</span>
                </div>
                <div className="lp-receipt-row">
                  <span style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>Sensor node ×1</span>
                  <span className="display" style={{ color: "#fff", fontSize: 18 }}>$75</span>
                </div>
                <div className="lp-receipt-row">
                  <span style={{ color: "rgba(255,255,255,.85)", fontWeight: 600, fontSize: 15 }}>Dashboard &amp; AI &amp; alerts</span>
                  <span style={{ color: "#E4B441", fontWeight: 700, fontSize: 15 }}>Free</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 0 0" }}>
                  <span className="display" style={{ color: "#fff", fontSize: 18 }}>Starter kit total</span>
                  <span className="display" style={{ color: "#E4B441", fontSize: 38, lineHeight: 1 }}>$105</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="lp-foot">
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/logo-icon.png" alt="" width={26} height={26} style={{ borderRadius: 6 }} />
            <span className="display" style={{ fontSize: 16, color: "#fff" }}>Soilify Labs</span>
          </Link>
          <nav>
            <a href="#how">How it works</a>
            <a href="#kit">The kit</a>
            <Link href="/mission">Mission</Link>
            <a href="#pricing">Pricing</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/login">Sign in</Link>
          </nav>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", margin: 0 }}>© 2026 Soilify Labs</p>
        </div>
      </footer>
    </main>
  );
}
