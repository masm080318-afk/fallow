import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IngestBody {
  node_id: string;
  moisture: number;
  temp?: number;
  raw?: number;
  farm_code?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: IngestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { node_id, moisture, temp, raw, farm_code } = body;
  if (!node_id || typeof moisture !== "number") {
    return NextResponse.json(
      { error: "Missing fields: node_id, moisture" },
      { status: 400 }
    );
  }

  const moisturePct = Math.round(Math.max(0, Math.min(100, moisture)));
  const svc = createServiceClient();

  let farmId: string;
  let displayNodeId: string;
  let alertThreshold: number | null = null;
  let alertsEnabled = true;

  if (farm_code) {
    // ── New path: gateway sends the farm's 6-digit pairing code ──
    // Nodes are auto-discovered: first packet from an unknown node_id
    // creates the sensor, so users never type IDs anywhere.
    const { data: farm } = await svc
      .from("farms")
      .select("id, alert_threshold, alerts_enabled")
      .eq("pairing_code", String(farm_code))
      .maybeSingle();

    if (!farm) {
      return NextResponse.json(
        { error: "Unknown pairing code. Re-run gateway setup with the code shown in the Soilify app." },
        { status: 404 }
      );
    }

    farmId = farm.id;
    displayNodeId = node_id;
    alertThreshold = farm.alert_threshold;
    alertsEnabled = farm.alerts_enabled !== false;

    const { data: existing } = await svc
      .from("sensor_nodes")
      .select("id")
      .eq("farm_id", farm.id)
      .eq("node_id", node_id)
      .maybeSingle();

    if (!existing) {
      await svc
        .from("sensor_nodes")
        .insert({ farm_id: farm.id, node_id, name: "New sensor" });
    }
  } else if (UUID_RE.test(node_id)) {
    // ── Legacy path: old firmware sends the sensor's UUID directly ──
    const { data: node, error: nodeErr } = await svc
      .from("sensor_nodes")
      .select("id, farm_id, name, node_id")
      .eq("id", node_id)
      .maybeSingle();

    if (nodeErr || !node) {
      return NextResponse.json(
        { error: "Unknown device ID. Copy the Device ID from Settings and flash it to your ESP32." },
        { status: 404 }
      );
    }

    farmId = node.farm_id;
    displayNodeId = node.node_id;

    const { data: farm } = await svc
      .from("farms")
      .select("alert_threshold, alerts_enabled")
      .eq("id", node.farm_id)
      .single();
    alertThreshold = farm?.alert_threshold ?? null;
    alertsEnabled = farm?.alerts_enabled !== false;
  } else {
    return NextResponse.json(
      { error: "Missing farm_code. Update your gateway firmware and pair it with the code from the Soilify app." },
      { status: 400 }
    );
  }

  const { error: insErr } = await svc.from("readings").insert({
    node_id: displayNodeId,
    farm_id: farmId,
    moisture_percent: moisturePct,
    temperature_f: typeof temp === "number" ? temp : null,
    raw_value: raw ?? null,
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  if (alertsEnabled && alertThreshold !== null && moisturePct < alertThreshold) {
    const origin = new URL(request.url).origin;
    await fetch(`${origin}/api/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farm_id: farmId, moisture: moisturePct }),
    }).catch((e) => console.error("alert call failed:", e));
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    info: "Soilify ingest endpoint. POST JSON { farm_code, node_id, moisture, raw?, temp? }",
  });
}
