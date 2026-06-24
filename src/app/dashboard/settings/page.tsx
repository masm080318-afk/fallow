"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Farm, SensorNode } from "@/types";
import { Save, Plus, Trash2, Copy, Check, MapPin, Cpu, Settings2, Radio } from "lucide-react";
import { CROP_TYPES } from "@/lib/et/crop-coefficients";

export default function SettingsPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeName, setNewNodeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [nodeError, setNodeError] = useState<string | null>(null);
  const [copiedFarmId, setCopiedFarmId] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: farmRow } = await supabase
      .from("farms").select("*").eq("user_id", user.id).single();
    setFarm(farmRow as Farm);
    if (farmRow) {
      const { data: nodesRow } = await supabase
        .from("sensor_nodes").select("*").eq("farm_id", farmRow.id).order("created_at");
      setNodes((nodesRow ?? []) as SensorNode[]);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!farm) return;
    setSaving(true); setSavedMsg(null);
    const supabase = createClient();
    const { error } = await supabase.from("farms").update({
      name: farm.name,
      phone: farm.phone,
      alert_threshold: farm.alert_threshold,
      alert_frequency_hours: farm.alert_frequency_hours,
      latitude: farm.latitude ?? null,
      longitude: farm.longitude ?? null,
      elevation: farm.elevation ?? null,
      crop_type: farm.crop_type ?? "garden",
    }).eq("id", farm.id);
    setSaving(false);
    setSavedMsg(error ? error.message : "Saved successfully.");
    setTimeout(() => setSavedMsg(null), 2500);
  };

  const addNode = async () => {
    if (!farm || !newNodeId.trim()) return;
    setNodeError(null);
    const res = await fetch("/api/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ node_id: newNodeId.trim(), name: newNodeName.trim() || "Sensor" }),
    });
    const json = await res.json();
    if (!res.ok) { setNodeError(json.error ?? "Failed to add sensor"); return; }
    setNodes((n) => [...n, json as SensorNode]);
    setNewNodeId(""); setNewNodeName("");
  };

  const removeNode = async (id: string) => {
    await fetch("/api/nodes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNodes((n) => n.filter((x) => x.id !== id));
  };

  if (!farm)
    return (
      <main className="px-4 py-5 max-w-2xl mx-auto">
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      </main>
    );

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4 pb-8">

      {/* Farm info */}
      <div className="card space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Settings2 size={15} style={{ color: "var(--green)" }} />
          </div>
          <h2 className="font-bold text-sm">Farm settings</h2>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Farm name</label>
          <input value={farm.name} onChange={(e) => setFarm({ ...farm, name: e.target.value })} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Phone number for SMS alerts</label>
          <input
            value={farm.phone ?? ""}
            onChange={(e) => setFarm({ ...farm, phone: e.target.value })}
            placeholder="+1 555 123 4567"
            type="tel"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Alert threshold
            </label>
            <span
              className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
              style={{ background: "rgba(92,158,42,0.1)", color: "var(--green)" }}
            >
              {farm.alert_threshold}%
            </span>
          </div>
          <input
            type="range" min={10} max={70}
            value={farm.alert_threshold}
            onChange={(e) => setFarm({ ...farm, alert_threshold: Number(e.target.value) })}
            className="!min-h-0 !p-0 !bg-transparent !border-0 w-full accent-green-600"
          />
          <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
            <span>10% (dry)</span><span>70% (wet)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Min hours between alerts
            </label>
            <span
              className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
              style={{ background: "rgba(92,158,42,0.1)", color: "var(--green)" }}
            >
              {farm.alert_frequency_hours}h
            </span>
          </div>
          <input
            type="range" min={1} max={24}
            value={farm.alert_frequency_hours}
            onChange={(e) => setFarm({ ...farm, alert_frequency_hours: Number(e.target.value) })}
            className="!min-h-0 !p-0 !bg-transparent !border-0 w-full"
          />
        </div>

        {/* ET / Location divider */}
        <div className="pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4 mt-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
              <Cpu size={14} style={{ color: "var(--green)" }} />
            </div>
            <p className="font-bold text-sm">ET irrigation settings</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Crop type</label>
              <select
                value={farm.crop_type ?? "garden"}
                onChange={(e) => setFarm({ ...farm, crop_type: e.target.value })}
              >
                {CROP_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label} (Kc = {c.kc})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Farm location</label>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors !min-h-0"
                  style={{ background: "rgba(92,158,42,0.07)", border: "1px solid rgba(92,158,42,0.15)", color: "var(--green)" }}
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setFarm({
                        ...farm,
                        latitude: Math.round(pos.coords.latitude * 10000) / 10000,
                        longitude: Math.round(pos.coords.longitude * 10000) / 10000,
                      });
                    });
                  }}
                >
                  <MapPin size={11} /> Use my location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" step="0.0001"
                  placeholder="Latitude (37.7749)"
                  value={farm.latitude ?? ""}
                  onChange={(e) => setFarm({ ...farm, latitude: e.target.value ? Number(e.target.value) : null })}
                />
                <input
                  type="number" step="0.0001"
                  placeholder="Longitude (-122.4194)"
                  value={farm.longitude ?? ""}
                  onChange={(e) => setFarm({ ...farm, longitude: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                Elevation (meters) — optional
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={farm.elevation ?? ""}
                onChange={(e) => setFarm({ ...farm, elevation: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save size={16} />
          {saving ? "Saving…" : "Save settings"}
        </button>
        {savedMsg && (
          <p
            className="text-sm text-center rounded-xl py-2 px-3"
            style={{
              color: savedMsg.startsWith("Saved") ? "var(--green)" : "var(--red)",
              background: savedMsg.startsWith("Saved") ? "rgba(92,158,42,0.06)" : "rgba(192,57,43,0.06)",
            }}
          >
            {savedMsg}
          </p>
        )}
      </div>

      {/* Farm ID */}
      <div className="card space-y-3">
        <h2 className="font-bold text-sm">Farm ID</h2>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Paste this into your Arduino sketch so the sensor knows which farm it belongs to.
        </p>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 rounded-xl px-3 py-2.5 text-xs break-all font-mono"
            style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)", color: "var(--foreground)" }}
          >
            {farm.id}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(farm.id);
              setCopiedFarmId(true);
              setTimeout(() => setCopiedFarmId(false), 1500);
            }}
            className="btn-secondary !px-3 shrink-0"
            aria-label="Copy Farm ID"
          >
            {copiedFarmId ? <Check size={15} style={{ color: "var(--green)" }} /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      {/* Sensors */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Radio size={14} style={{ color: "var(--green)" }} />
          </div>
          <h2 className="font-bold text-sm">Sensors</h2>
          {nodes.length > 0 && (
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(92,158,42,0.1)", color: "var(--green)" }}
            >
              {nodes.length} active
            </span>
          )}
        </div>

        {nodes.length > 0 && (
          <ul className="space-y-2">
            {nodes.map((n) => (
              <li
                key={n.id}
                className="rounded-xl px-4 py-3 space-y-2"
                style={{ background: "rgba(92,158,42,0.04)", border: "1px solid rgba(92,158,42,0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{n.name}</div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{n.node_id}</div>
                  </div>
                  <button
                    onClick={() => removeNode(n.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors !min-h-0 !p-0 !bg-transparent !border-0 hover:bg-red-50"
                    style={{ color: "var(--muted)" }}
                    aria-label="Remove sensor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <code
                    className="flex-1 text-[10px] font-mono rounded-lg px-2 py-1.5 break-all"
                    style={{ background: "rgba(0,0,0,0.05)", color: "var(--muted)" }}
                  >
                    {n.id}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(n.id)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors !min-h-0 !p-0 !bg-transparent !border-0"
                    style={{ color: "var(--muted)" }}
                    title="Copy Device ID for Arduino"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {nodes.length === 0 && (
          <p className="text-sm py-2" style={{ color: "var(--muted)" }}>No sensors added yet.</p>
        )}

        <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Add a sensor</p>
          <input
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            placeholder="Node ID (from your sketch)"
          />
          <input
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Display name (e.g. South Field)"
          />
          <button
            onClick={addNode}
            disabled={!newNodeId.trim()}
            className="btn-secondary w-full"
          >
            <Plus size={16} /> Add sensor
          </button>
          {nodeError && (
            <p className="text-sm text-center" style={{ color: "var(--red)" }}>{nodeError}</p>
          )}
        </div>
      </div>
    </main>
  );
}
