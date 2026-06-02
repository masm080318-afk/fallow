import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IngestBody {
  node_id: string;
  farm_id?: string;   // required when multiple farms share the same node_id
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

  const { node_id, farm_id, moisture, temp, raw } = body;
  if (!node_id || typeof moisture !== "number") {
    return NextResponse.json(
      { error: "Missing fields: node_id, moisture" },
      { status: 400 }
    );
  }

  const moisturePct = Math.round(Math.max(0, Math.min(100, moisture)));

  const svc = createServiceClient();

  // Look up by (node_id + farm_id) when provided — required now that node_id
  // is only unique per farm, not globally.
  let nodeQuery = svc
    .from("sensor_nodes")
    .select("id, farm_id, name")
    .eq("node_id", node_id);
  if (farm_id) nodeQuery = nodeQuery.eq("farm_id", farm_id);

  const { data: node, error: nodeErr } = await nodeQuery.maybeSingle();

  if (nodeErr) {
    // maybeSingle errors when multiple rows match — node_id is ambiguous across farms
    return NextResponse.json(
      { error: "Ambiguous node_id — add farm_id to your payload. See Settings for your Farm ID." },
      { status: 400 }
    );
  }
  if (!node) {
    return NextResponse.json(
      { error: "Unknown node_id. Register this sensor in Settings first." },
      { status: 404 }
    );
  }

  const { error: insErr } = await svc.from("readings").insert({
    node_id,
    farm_id: node.farm_id,
    moisture_percent: moisturePct,
    temperature_f: typeof temp === "number" ? temp : null,
    raw_value: raw ?? null,
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  // Fire-and-forget: load farm + last 24h history, run diagnosis, maybe alert.
  // We await briefly so errors are logged, but use Promise.allSettled to not block on either.
  const origin = new URL(request.url).origin;

  const { data: farm } = await svc
    .from("farms")
    .select("alert_threshold, alerts_enabled")
    .eq("id", node.farm_id)
    .single();

  // Only send SMS alert automatically — diagnosis is triggered manually by user.
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
