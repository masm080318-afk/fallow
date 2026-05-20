"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AlertLog, Farm } from "@/types";
import { Bell, BellOff, Send, Droplets } from "lucide-react";

export default function AlertsPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const load = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
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

  useEffect(() => {
    load();
  }, []);

  const toggleEnabled = async () => {
    if (!farm) return;
    const supabase = createClient();
    const next = !farm.alerts_enabled;
    setFarm({ ...farm, alerts_enabled: next });
    await supabase
      .from("farms")
      .update({ alerts_enabled: next })
      .eq("id", farm.id);
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
        setTestMsg("Test SMS sent. Check your phone.");
        load();
      } else {
        setTestMsg(json.error ?? "Failed to send.");
      }
    } catch {
      setTestMsg("Network error.");
    }
    setTesting(false);
  };

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-semibold">SMS alerts</h2>
            <p className="text-sm text-muted">
              {farm?.phone
                ? `Sending to ${farm.phone}`
                : "Add a phone number in Settings"}
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={!farm}
            className={`relative w-12 h-7 rounded-full transition-colors !min-h-0 ${
              farm?.alerts_enabled ? "bg-green" : "bg-[#262626]"
            }`}
            aria-label="Toggle alerts"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                farm?.alerts_enabled ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted mt-2">
          {farm?.alerts_enabled ? (
            <Bell size={14} className="text-green" />
          ) : (
            <BellOff size={14} />
          )}
          Threshold: below {farm?.alert_threshold ?? 30}% moisture
        </div>

        <button
          onClick={sendTest}
          disabled={testing || !farm?.phone}
          className="btn-secondary w-full mt-4 text-sm"
        >
          <Send size={14} />
          {testing ? "Sending..." : "Send test SMS"}
        </button>
        {testMsg && (
          <p className="text-sm text-center mt-3 text-muted">{testMsg}</p>
        )}
      </div>

      <div className="card">
        <h3 className="text-sm uppercase tracking-wider text-muted mb-3">
          Recent alerts
        </h3>
        {loading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-muted text-sm py-6 text-center">
            No alerts sent yet. Quiet fields are happy fields.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="py-3 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <Droplets className="text-red mt-0.5" size={16} />
                  <div>
                    <div className="text-sm">
                      {a.alert_type === "low_moisture"
                        ? "Low moisture alert"
                        : a.alert_type}
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(a.sent_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {a.moisture_at_alert !== null && (
                  <span className="text-red text-sm font-semibold">
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
