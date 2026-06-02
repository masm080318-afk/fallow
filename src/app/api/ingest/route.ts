import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IngestBody {
  node_id: string;
  moisture: number;
  temp?: number;
  raw?: number;
}

export async function POST(request: Request) {
  let body: IngestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { node_id, moisture, temp, raw } = body;
  if (!node_id || typeof moisture !== "number") {
    return NextResponse.json(
      { error: "Missing fields: node_id, moisture" },
      { status: 400 }
    );
  }

  const moisturePct = Math.round(Math.max(0, Math.min(100, moisture)));

  const svc = createServiceClient();

  // node_id in the payload is the sensor's UUID (from Settings → copy device ID).
  // This is globally unique so no farm_id is needed.
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

  const { error: insErr } = await svc.from("readings").insert({
    node_id: node.node_id, // store the display name, not the UUID
    farm_id: node.farm_id,
    moisture_percent: moisturePct,
    temperature_f: typeof temp === "number" ? temp : null,
    raw_value: raw ?? null,
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  const origin = new URL(request.url).origin;

  const { data: farm } = await svc
    .from("farms")
    .select("alert_threshold, alerts_enabled")
    .eq("id", node.farm_id)
    .single();

  if (farm && farm.alerts_enabled !== false && moisturePct < farm.alert_threshold) {
    await fetch(`${origin}/api/alert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farm_id: node.farm_id, moisture: moisturePct }),
    }).catch((e) => console.error("alert call failed:", e));
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    info: "Fallow ingest endpoint. POST JSON { node_id, moisture, temp, raw? }",
  });
}
