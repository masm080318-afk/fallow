"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Farm, SensorNode } from "@/types";
import { Save, Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeName, setNewNodeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [nodeError, setNodeError] = useState<string | null>(null);

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
    setFarm(farmRow as Farm);
    if (farmRow) {
      const { data: nodesRow } = await supabase
        .from("sensor_nodes")
        .select("*")
        .eq("farm_id", farmRow.id)
        .order("created_at");
      setNodes((nodesRow ?? []) as SensorNode[]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!farm) return;
    setSaving(true);
    setSavedMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("farms")
      .update({
        name: farm.name,
        phone: farm.phone,
        alert_threshold: farm.alert_threshold,
        alert_frequency_hours: farm.alert_frequency_hours,
      })
      .eq("id", farm.id);
    setSaving(false);
    setSavedMsg(error ? error.message : "Saved.");
    setTimeout(() => setSavedMsg(null), 2500);
  };

  const addNode = async () => {
    if (!farm || !newNodeId.trim()) return;
    setNodeError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sensor_nodes")
      .upsert({
        farm_id: farm.id,
        node_id: newNodeId.trim(),
        name: newNodeName.trim() || "Sensor",
      }, { onConflict: "node_id" })
      .select("*")
      .single();
    if (error) {
      setNodeError(error.message);
      return;
    }
    if (data) {
      setNodes((n) => [...n, data as SensorNode]);
      setNewNodeId("");
      setNewNodeName("");
    }
  };

  const removeNode = async (id: string) => {
    const supabase = createClient();
    await supabase.from("sensor_nodes").delete().eq("id", id);
    setNodes((n) => n.filter((x) => x.id !== id));
  };

  if (!farm)
    return (
      <main className="px-4 py-5 max-w-2xl mx-auto">
        <p className="text-muted">Loading...</p>
      </main>
    );

  return (
    <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <div className="card space-y-4">
        <h2 className="font-semibold">Farm</h2>
        <div className="space-y-2">
          <label className="text-sm text-muted">Farm name</label>
          <input
            value={farm.name}
            onChange={(e) => setFarm({ ...farm, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted">Phone number</label>
          <input
            value={farm.phone ?? ""}
            onChange={(e) => setFarm({ ...farm, phone: e.target.value })}
            placeholder="+1 555 123 4567"
            type="tel"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted">
            Alert threshold: {farm.alert_threshold}%
          </label>
          <input
            type="range"
            min={10}
            max={70}
            value={farm.alert_threshold}
            onChange={(e) =>
              setFarm({ ...farm, alert_threshold: Number(e.target.value) })
            }
            className="!min-h-0 !p-0 !bg-transparent !border-0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted">
            Minimum hours between alerts: {farm.alert_frequency_hours}
          </label>
          <input
            type="range"
            min={1}
            max={24}
            value={farm.alert_frequency_hours}
            onChange={(e) =>
              setFarm({
                ...farm,
                alert_frequency_hours: Number(e.target.value),
              })
            }
            className="!min-h-0 !p-0 !bg-transparent !border-0"
          />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </button>
        {savedMsg && (
          <p className="text-sm text-green text-center">{savedMsg}</p>
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">Sensors</h2>
        {nodes.length === 0 && (
          <p className="text-muted text-sm">No sensors yet.</p>
        )}
        <ul className="space-y-2 mb-4">
          {nodes.map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between bg-[#0f0f0f] border border-[var(--border)] rounded-lg px-3 py-2"
            >
              <div>
                <div className="font-medium text-sm">{n.name}</div>
                <div className="text-xs text-muted">{n.node_id}</div>
              </div>
              <button
                onClick={() => removeNode(n.id)}
                className="text-muted hover:text-red transition-colors"
                aria-label="Remove sensor"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <input
            value={newNodeId}
            onChange={(e) => setNewNodeId(e.target.value)}
            placeholder="Node ID"
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
            <p className="text-sm text-center mt-2" style={{ color: "var(--red)" }}>{nodeError}</p>
          )}
        </div>
      </div>
    </main>
  );
}
