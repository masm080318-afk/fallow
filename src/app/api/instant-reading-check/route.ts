import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { node_id } = await request.json();
  if (!node_id) {
    return NextResponse.json({ error: "Missing node_id" }, { status: 400 });
  }

  const svc = createServiceClient();

  // Look up the sensor node by UUID
  const { data: node, error: nodeErr } = await svc
    .from("sensor_nodes")
    .select("id, farm_id")
    .eq("id", node_id)
    .maybeSingle();

  if (nodeErr || !node) {
    return NextResponse.json(
      { error: "Unknown device" },
      { status: 404 }
    );
  }

  // Check if instant reading was requested for this farm
  const { data: farm } = await svc
    .from("farms")
    .select("instant_reading_requested")
    .eq("id", node.farm_id)
    .single();

  const requested = farm?.instant_reading_requested === true;

  // If requested, clear the flag
  if (requested) {
    await svc
      .from("farms")
      .update({ instant_reading_requested: false })
      .eq("id", node.farm_id);
  }

  return NextResponse.json({ requested });
}
