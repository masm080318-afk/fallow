"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Farm, SensorNode } from "@/types";
import { Save, Plus, Trash2, Copy, Check, MapPin, Cpu, Settings2, Radio, Share2, Snowflake, UserX, RefreshCw, Wifi, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { CROP_TYPES } from "@/lib/et/crop-coefficients";

export default function SettingsPage() {
  const router = useRouter();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeName, setNewNodeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [nodeError, setNodeError] = useState<string | null>(null);
  const [copiedFarmId, setCopiedFarmId] = useState(false);

  // Share link state
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Delete account state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Gateway pairing + sensor rename + advanced section
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: farmRow } = await supabase.from("farms").select("*").eq("user_id", user.id).single();
    setFarm(farmRow as Farm);
    if (farmRow) {
      const { data: nodesRow } = await supabase
        .from("sensor_nodes").select("*").eq("farm_id", farmRow.id).order("created_at");
      setNodes((nodesRow ?? []) as SensorNode[]);
    }
    // Gateway pairing code (generated server-side on first request)
    try {
      const res = await fetch("/api/farm/pairing-code");
      const json = await res.json();
      if (res.ok && json.code) setPairCode(json.code);
    } catch { /* non-fatal */ }
  };

  useEffect(() => { load(); }, []);

  const copyCode = () => {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const renameNode = async (id: string) => {
    if (!editName.trim()) { setEditingId(null); return; }
    const res = await fetch("/api/nodes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim() }),
    });
    if (res.ok) {
      setNodes((n) => n.map((x) => (x.id === id ? { ...x, name: editName.trim() } : x)));
    }
    setEditingId(null);
  };

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
      frost_alerts_enabled: farm.frost_alerts_enabled ?? false,
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

  const generateShareLink = async () => {
    setShareLoading(true);
    const res = await fetch("/api/farm/invite");
    const json = await res.json();
    if (json.token) {
      setShareLink(`${window.location.origin}/join/${json.token}`);
    }
    setShareLoading(false);
  };

  const revokeShareLink = async () => {
    await fetch("/api/farm/invite", { method: "DELETE" });
    setShareLink(null);
  };

  const copyShare = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 1500);
  };

  const deleteAccount = async () => {
    setDeleting(true);
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/");
    } else {
      const json = await res.json();
      alert("Error: " + (json.error ?? "Failed to delete account"));
      setDeleting(false);
      setConfirmDelete(false);
    }
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
          <input value={farm.phone ?? ""} onChange={(e) => setFarm({ ...farm, phone: e.target.value })} placeholder="+1 555 123 4567" type="tel" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Alert threshold</label>
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ background: "rgba(92,158,42,0.1)", color: "var(--green)" }}>
              {farm.alert_threshold}%
            </span>
          </div>
          <input type="range" min={10} max={70} value={farm.alert_threshold}
            onChange={(e) => setFarm({ ...farm, alert_threshold: Number(e.target.value) })}
            className="!min-h-0 !p-0 !bg-transparent !border-0 w-full accent-green-600" />
          <div className="flex justify-between text-xs" style={{ color: "var(--muted)" }}>
            <span>10% (dry)</span><span>70% (wet)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Min hours between alerts</label>
            <span className="text-sm font-bold px-2.5 py-0.5 rounded-lg" style={{ background: "rgba(92,158,42,0.1)", color: "var(--green)" }}>
              {farm.alert_frequency_hours}h
            </span>
          </div>
          <input type="range" min={1} max={24} value={farm.alert_frequency_hours}
            onChange={(e) => setFarm({ ...farm, alert_frequency_hours: Number(e.target.value) })}
            className="!min-h-0 !p-0 !bg-transparent !border-0 w-full" />
        </div>

        {/* ET / Location */}
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
              <select value={farm.crop_type ?? "garden"} onChange={(e) => setFarm({ ...farm, crop_type: e.target.value })}>
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
                <input type="number" step="0.0001" placeholder="Latitude (37.7749)" value={farm.latitude ?? ""}
                  onChange={(e) => setFarm({ ...farm, latitude: e.target.value ? Number(e.target.value) : null })} />
                <input type="number" step="0.0001" placeholder="Longitude (-122.4194)" value={farm.longitude ?? ""}
                  onChange={(e) => setFarm({ ...farm, longitude: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Elevation (meters) — optional</label>
              <input type="number" placeholder="e.g. 150" value={farm.elevation ?? ""}
                onChange={(e) => setFarm({ ...farm, elevation: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>
        </div>

        {/* Frost alert toggle */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Snowflake size={15} style={{ color: "#3b82f6" }} />
            <div>
              <p className="text-sm font-semibold">Frost alerts</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>SMS when outdoor temp drops below 35°F</p>
            </div>
          </div>
          <button
            onClick={() => setFarm({ ...farm, frost_alerts_enabled: !farm.frost_alerts_enabled })}
            className="relative w-12 h-7 rounded-full transition-colors duration-200 !min-h-0 !p-0 !border-0 shrink-0"
            style={{ background: farm.frost_alerts_enabled ? "#3b82f6" : "#d0d8d0" }}
            aria-label="Toggle frost alerts"
          >
            <span
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm"
              style={{ transform: farm.frost_alerts_enabled ? "translateX(20px)" : "translateX(0)" }}
            />
          </button>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save size={16} />
          {saving ? "Saving…" : "Save settings"}
        </button>
        {savedMsg && (
          <p className="text-sm text-center rounded-xl py-2 px-3"
            style={{
              color: savedMsg.startsWith("Saved") ? "var(--green)" : "var(--red)",
              background: savedMsg.startsWith("Saved") ? "rgba(92,158,42,0.06)" : "rgba(192,57,43,0.06)",
            }}>
            {savedMsg}
          </p>
        )}
      </div>

      {/* Gateway pairing */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Wifi size={14} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <h2 className="font-bold text-sm">Gateway pairing code</h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Links your gateway to this farm</p>
          </div>
        </div>

        <div
          className="rounded-2xl py-5 px-4 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(92,158,42,0.08), rgba(92,158,42,0.03))",
            border: "1px solid rgba(92,158,42,0.2)",
          }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-black tracking-[0.25em]" style={{ color: "var(--green)" }}>
              {pairCode ?? "······"}
            </span>
            {pairCode && (
              <button onClick={copyCode} className="btn-secondary !px-3 !min-h-0 !py-2 shrink-0" aria-label="Copy pairing code">
                {copiedCode ? <Check size={15} style={{ color: "var(--green)" }} /> : <Copy size={15} />}
              </button>
            )}
          </div>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          Setting up a gateway? Plug it in, join the <strong>“Soilify-Setup”</strong> WiFi from your phone,
          then pick your home WiFi and type this code on the page that opens.
          Sensors appear below automatically — nothing to type or flash.
        </p>
      </div>

      {/* Share farm */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Share2 size={14} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <h2 className="font-bold text-sm">Share farm access</h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Send this link so family/team can view your farm</p>
          </div>
        </div>

        {!shareLink ? (
          <button onClick={generateShareLink} disabled={shareLoading} className="btn-secondary w-full">
            {shareLoading ? <RefreshCw size={14} className="animate-spin" /> : <Share2 size={14} />}
            {shareLoading ? "Generating…" : "Generate invite link"}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl px-3 py-2.5 text-xs break-all font-mono"
                style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)", color: "var(--foreground)" }}>
                {shareLink}
              </code>
              <button onClick={copyShare} className="btn-secondary !px-3 shrink-0" aria-label="Copy share link">
                {copiedShare ? <Check size={15} style={{ color: "var(--green)" }} /> : <Copy size={15} />}
              </button>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Anyone with this link can view your farm.{" "}
              <button onClick={revokeShareLink} className="underline !min-h-0 !p-0 !bg-transparent !border-0 font-medium" style={{ color: "var(--red)" }}>
                Revoke link
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Sensors */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(92,158,42,0.1)" }}>
            <Radio size={14} style={{ color: "var(--green)" }} />
          </div>
          <h2 className="font-bold text-sm">Sensors</h2>
          {nodes.length > 0 && (
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(92,158,42,0.1)", color: "var(--green)" }}>
              {nodes.length} active
            </span>
          )}
        </div>

        {nodes.length > 0 && (
          <ul className="space-y-2">
            {nodes.map((n) => (
              <li key={n.id} className="rounded-xl px-4 py-3 space-y-2"
                style={{ background: "rgba(92,158,42,0.04)", border: "1px solid rgba(92,158,42,0.1)" }}>
                <div className="flex items-center justify-between gap-2">
                  {editingId === n.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && renameNode(n.id)}
                        autoFocus
                        className="!min-h-0 !py-2 text-sm"
                        placeholder="e.g. North field"
                      />
                      <button onClick={() => renameNode(n.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg !min-h-0 !p-0 !border-0 shrink-0"
                        style={{ background: "rgba(92,158,42,0.12)", color: "var(--green)" }} aria-label="Save name">
                        <Check size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{n.name}</span>
                        <button
                          onClick={() => { setEditingId(n.id); setEditName(n.name === "New sensor" ? "" : n.name); }}
                          className="w-6 h-6 flex items-center justify-center rounded-md !min-h-0 !p-0 !bg-transparent !border-0 shrink-0"
                          style={{ color: "var(--muted)" }} aria-label="Rename sensor">
                          <Pencil size={12} />
                        </button>
                        {n.name === "New sensor" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: "rgba(184,134,11,0.12)", color: "var(--yellow)" }}>
                            just joined — give it a name
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: "var(--muted)" }}>{n.node_id}</div>
                    </div>
                  )}
                  <button onClick={() => removeNode(n.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors !min-h-0 !p-0 !bg-transparent !border-0 hover:bg-red-50 shrink-0"
                    style={{ color: "var(--muted)" }} aria-label="Remove sensor">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {nodes.length === 0 && (
          <div className="rounded-xl px-4 py-5 text-center"
            style={{ background: "rgba(92,158,42,0.04)", border: "1px dashed rgba(92,158,42,0.25)" }}>
            <Radio size={18} className="mx-auto mb-2" style={{ color: "var(--muted)" }} />
            <p className="text-sm font-medium">No sensors yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Once your gateway is paired, sensors show up here on their own within 15 minutes of powering on.
            </p>
          </div>
        )}

        {/* Advanced: legacy device keys + manual add */}
        <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold !min-h-0 !p-0 !bg-transparent !border-0"
            style={{ color: "var(--muted)" }}
          >
            {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            Advanced (manual setup)
          </button>

          {showAdvanced && (
            <div className="space-y-4 mt-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Farm ID (legacy firmware)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-xl px-3 py-2.5 text-xs break-all font-mono"
                    style={{ background: "rgba(92,158,42,0.05)", border: "1px solid rgba(92,158,42,0.12)", color: "var(--foreground)" }}>
                    {farm.id}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(farm.id); setCopiedFarmId(true); setTimeout(() => setCopiedFarmId(false), 1500); }}
                    className="btn-secondary !px-3 shrink-0" aria-label="Copy Farm ID">
                    {copiedFarmId ? <Check size={15} style={{ color: "var(--green)" }} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              {nodes.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Device IDs (legacy firmware)</p>
                  {nodes.map((n) => (
                    <div key={n.id} className="flex items-center gap-2">
                      <code className="flex-1 text-[10px] font-mono rounded-lg px-2 py-1.5 break-all"
                        style={{ background: "rgba(0,0,0,0.05)", color: "var(--muted)" }}>
                        {n.id}
                      </code>
                      <button onClick={() => navigator.clipboard.writeText(n.id)}
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg !min-h-0 !p-0 !bg-transparent !border-0"
                        style={{ color: "var(--muted)" }} title="Copy Device ID">
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Add a sensor manually</p>
                <input value={newNodeId} onChange={(e) => setNewNodeId(e.target.value)} placeholder="Node ID (from your sketch)" />
                <input value={newNodeName} onChange={(e) => setNewNodeName(e.target.value)} placeholder="Display name (e.g. South Field)" />
                <button onClick={addNode} disabled={!newNodeId.trim()} className="btn-secondary w-full">
                  <Plus size={16} /> Add sensor
                </button>
                {nodeError && <p className="text-sm text-center" style={{ color: "var(--red)" }}>{nodeError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card space-y-3" style={{ borderColor: "rgba(192,57,43,0.2)" }}>
        <div className="flex items-center gap-2">
          <UserX size={15} style={{ color: "var(--red)" }} />
          <h2 className="font-bold text-sm" style={{ color: "var(--red)" }}>Danger zone</h2>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Permanently deletes your account, farm, all sensor data, and readings. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-all !min-h-0"
            style={{ background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.2)", color: "var(--red)" }}>
            Delete account
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-center" style={{ color: "var(--red)" }}>Are you sure? This is permanent.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="btn-secondary flex-1 !min-h-0">Cancel</button>
              <button onClick={deleteAccount} disabled={deleting}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all !min-h-0"
                style={{ background: "var(--red)", color: "#fff" }}>
                {deleting ? "Deleting…" : "Yes, delete everything"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
