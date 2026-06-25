"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AlertLog, Farm } from "@/types";
import { Bell, BellOff, Send, Droplets, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";

export default function AlertsPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [twilioInfo, setTwilioInfo] = useState<{
    twilio_sid_set: boolean; twilio_token_set: boolean;
    twilio_from: string | null; farm_phone: string | null; sid_preview: string | null;
  } | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: farmRow } = await supabase
      .from("farms")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (!farmRow) return;
    setFarm(farmRow as Farm);

    const { data: alertsRow } = await supabase
      .from("alerts_log")
      .select("*")
      .eq("farm_id", farmRow.id)
      .order("sent_at", { ascending: false })
      .limit(50);

    setAlerts((alertsRow ?? []) as AlertLog[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleEnabled = async () => {
    if (!farm) return;
    const supabase = createClient();
    const next = !farm.alerts_enabled;
    setFarm({ ...farm, alerts_enabled: next });
    await supabase.from("farms").update({ alerts_enabled: next }).eq("id", farm.id);
  };

  const loadTwilioDebug = async () => {
    setShowDebug(true);
    const res = await fetch("/api/twilio-check");
    const json = await res.json();
    setTwilioInfo(json);
  };

  const sendTest = async () => {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });
      const json = await res.json();
      if (res.ok) {
        setTestMsg({ text: "Test SMS sent — check your phone.", ok: true });
        load();
      } else {
        setTestMsg({ text: json.error ?? "Failed to send.", ok: false });
      }
    } catch {
      setTestMsg({ text: "Network error.", ok: false });
    }
    setTesting(false);
  };

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">

      {/* SMS control card */}
      <div className="card space-y-4">
        {/* Toggle row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: farm?.alerts_enabled ? "rgba(92,158,42,0.1)" : "rgba(0,0,0,0.04)" }}
            >
              {farm?.alerts_enabled
                ? <Bell size={17} style={{ color: "var(--green)" }} />
                : <BellOff size={17} style={{ color: "var(--muted)" }} />
              }
            </div>
            <div>
              <h2 className="font-semibold text-sm">SMS alerts</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {farm?.phone
                  ? `Sending to ${farm.phone}`
                  : "Add a phone number in Settings"}
              </p>
            </div>
          </div>

          <button
            onClick={toggleEnabled}
            disabled={!farm}
            className="relative w-12 h-7 rounded-full transition-colors duration-200 !min-h-0 !p-0 !border-0 shrink-0"
            style={{ background: farm?.alerts_enabled ? "var(--green)" : "#d0d8d0" }}
            aria-label="Toggle alerts"
          >
            <span
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm"
              style={{ transform: farm?.alerts_enabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>

        {/* Threshold info */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
          style={{
            background: "rgba(92,158,42,0.05)",
            border: "1px solid rgba(92,158,42,0.12)",
            color: "var(--muted)",
          }}
        >
          <Droplets size={13} style={{ color: "var(--green)" }} />
          Fires when soil moisture drops below{" "}
          <strong style={{ color: "var(--foreground)" }}>{farm?.alert_threshold ?? 30}%</strong>
          <span className="ml-auto">
            <a href="/dashboard/settings" style={{ color: "var(--green)" }} className="font-semibold">Edit →</a>
          </span>
        </div>

        {/* Test button */}
        <button
          onClick={sendTest}
          disabled={testing || !farm?.phone}
          className="btn-secondary w-full text-sm"
        >
          <Send size={14} />
          {testing ? "Sending…" : "Send test SMS"}
        </button>

        {testMsg && (
          <p className="text-sm text-center rounded-xl py-2.5 px-3"
            style={{
              color: testMsg.ok ? "var(--green)" : "var(--red)",
              background: testMsg.ok ? "rgba(92,158,42,0.06)" : "rgba(192,57,43,0.06)",
              border: `1px solid ${testMsg.ok ? "rgba(92,158,42,0.2)" : "rgba(192,57,43,0.2)"}`,
            }}>
            {testMsg.text}
          </p>
        )}

        {/* Twilio debug panel */}
        {!showDebug ? (
          <button onClick={loadTwilioDebug} className="w-full text-xs py-2 !min-h-0 !border-0 !bg-transparent" style={{ color: "var(--muted)" }}>
            <Info size={11} className="inline mr-1" /> SMS not working? Check configuration
          </button>
        ) : twilioInfo ? (
          <div className="rounded-xl p-3 space-y-1.5 text-xs" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--border)" }}>
            <p className="font-semibold mb-2">Twilio configuration</p>
            {[
              { label: "Account SID", ok: twilioInfo.twilio_sid_set, detail: twilioInfo.sid_preview },
              { label: "Auth token", ok: twilioInfo.twilio_token_set, detail: twilioInfo.twilio_token_set ? "Set" : "Missing" },
              { label: "From number", ok: !!twilioInfo.twilio_from, detail: twilioInfo.twilio_from ?? "Missing — set TWILIO_FROM in Vercel env vars" },
              { label: "Farm phone", ok: !!twilioInfo.farm_phone, detail: twilioInfo.farm_phone ?? "Not set — add in Settings" },
            ].map(({ label, ok, detail }) => (
              <div key={label} className="flex items-start gap-2">
                {ok ? <CheckCircle size={12} style={{ color: "var(--green)", marginTop: 1, flexShrink: 0 }} /> : <XCircle size={12} style={{ color: "var(--red)", marginTop: 1, flexShrink: 0 }} />}
                <span style={{ color: "var(--muted)" }}><strong style={{ color: "var(--foreground)" }}>{label}:</strong> {detail}</span>
              </div>
            ))}
            <p className="pt-1" style={{ color: "var(--muted)" }}>
              Trial accounts can only text <strong style={{ color: "var(--foreground)" }}>verified numbers</strong>. Go to{" "}
              <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--green)" }}>console.twilio.com</a>
              {" "}→ Phone Numbers → Verified Caller IDs to add your number.
            </p>
          </div>
        ) : null}
      </div>

      {/* History card */}
      <div className="card">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>
          Alert history
        </h3>

        {loading ? (
          <div className="py-8 text-center text-sm" style={{ color: "var(--muted)" }}>Loading…</div>
        ) : alerts.length === 0 ? (
          <div className="py-10 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "rgba(92,158,42,0.07)" }}
            >
              <Bell size={20} style={{ color: "var(--green)" }} />
            </div>
            <p className="font-semibold text-sm mb-1">No alerts yet</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Quiet fields are happy fields.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl"
                style={{
                  background: "rgba(192,57,43,0.04)",
                  border: "1px solid rgba(192,57,43,0.1)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(192,57,43,0.08)" }}
                  >
                    <AlertCircle size={15} style={{ color: "var(--red)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {a.alert_type === "low_moisture" ? "Low moisture" : a.alert_type}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {new Date(a.sent_at).toLocaleString([], {
                        month: "short", day: "numeric",
                        hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {a.moisture_at_alert !== null && (
                  <span
                    className="text-sm font-black shrink-0 px-2.5 py-1 rounded-lg"
                    style={{ color: "var(--red)", background: "rgba(192,57,43,0.08)" }}
                  >
                    {a.moisture_at_alert}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
