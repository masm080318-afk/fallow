import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/camera-poll?device_id=xxx
// Called by ESP32-CAM every 30s. Returns { capture: true/false }.
// Atomically clears the flag when returning true.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const device_id = searchParams.get("device_id");
  if (!device_id) return NextResponse.json({ error: "device_id required" }, { status: 400 });

  const svc = createServiceClient();

  // Look up which farm this camera belongs to
  const { data: node } = await svc
    .from("sensor_nodes")
    .select("farm_id")
    .eq("id", device_id)
    .maybeSingle();

  if (!node) return NextResponse.json({ error: "Unknown device_id" }, { status: 404 });

  const { data: farm } = await svc
    .from("farms")
    .select("pending_capture")
    .eq("id", node.farm_id)
    .single();

  if (!farm) return NextResponse.json({ capture: false });

  if (farm.pending_capture) {
    // Clear the flag so only one camera responds
    await svc.from("farms").update({ pending_capture: false }).eq("id", node.farm_id);
    return NextResponse.json({ capture: true });
  }

  return NextResponse.json({ capture: false });
}
