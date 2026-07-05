import PublicNav from "@/components/layout/PublicNav";
import PublicFooter from "@/components/layout/PublicFooter";

export const metadata = { title: "Privacy Policy — Soilify Labs" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--paper)" }}>
      <PublicNav />

      <section className="px-6 py-24" style={{ background: "var(--ink)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Legal</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white leading-tight">Privacy Policy</h1>
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Last updated July 2026</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-10" style={{ color: "var(--ink-soft)" }}>

          <p className="leading-relaxed">
            Soilify Labs (&quot;we&quot;, &quot;us&quot;) provides soil-monitoring hardware and
            software for small farms. This policy explains what data our website and iOS app
            collect, why, and how it&apos;s handled.
          </p>

          <div>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li><strong>Account information</strong> — your name and email address, provided by Google or Apple when you sign in. We never see or store your password.</li>
              <li><strong>Farm location</strong> — latitude/longitude you provide, used to fetch local weather and calculate watering recommendations.</li>
              <li><strong>Phone number</strong> — optional, used only to send SMS alerts when your soil moisture crosses a threshold you set.</li>
              <li><strong>Sensor readings</strong> — soil moisture, temperature, and related data sent automatically by your Soilify hardware.</li>
              <li><strong>Photos</strong> — crop photos you choose to submit for AI plant-health analysis, taken with your camera or chosen from your photo library. Photos are analyzed and stored so you can review past diagnoses.</li>
              <li><strong>Push notification token</strong> — a device identifier used to deliver app notifications, generated only if you enable notifications in the app.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>How we use it</h2>
            <p className="leading-relaxed">
              Your data is used only to operate Soilify Labs: showing your dashboard, calculating
              irrigation recommendations, running AI plant-health diagnosis, and sending the
              alerts you&apos;ve opted into. We do not sell your personal data.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>Third parties we use</h2>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li><strong>Supabase</strong> — hosts our database and handles authentication.</li>
              <li><strong>Google / Apple</strong> — sign-in providers. We only receive your name and email from them.</li>
              <li><strong>Anthropic</strong> — powers AI crop-photo and soil diagnosis. Photos and readings you submit for diagnosis are sent to Anthropic&apos;s API for analysis.</li>
              <li><strong>TextBelt</strong> — delivers SMS soil alerts to the phone number you provide.</li>
              <li><strong>Open-Meteo</strong> — public weather data, queried using your farm&apos;s coordinates (no personal data sent).</li>
              <li><strong>Vercel</strong> — hosts our website and app backend.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>Your choices</h2>
            <p className="leading-relaxed">
              You can delete your account and all associated data at any time from Settings in
              the app, or by contacting us. Push notifications, location, camera, and photo
              access can all be revoked at any time in your device&apos;s system settings.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>Children</h2>
            <p className="leading-relaxed">
              Soilify Labs is not directed at children under 13, and we do not knowingly collect
              data from them.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl mb-3" style={{ color: "var(--ink)" }}>Contact</h2>
            <p className="leading-relaxed">
              Questions about this policy or your data? Reach us via the{" "}
              <a href="/contact" className="underline hover:no-underline">contact page</a>.
            </p>
          </div>

        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
