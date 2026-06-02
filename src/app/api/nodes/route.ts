import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/nodes — add a sensor node
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { node_id, name } = await request.json();
  if (!node_id?.trim()) return NextResponse.json({ error: "node_id required" }, { status: 400 });

  const svc = createServiceClient();

  // Verify the user has a farm
  const { data: farm } = await svc.from("farms").select("id").eq("user_id", user.id).single();
  if (!farm) return NextResponse.json({ error: "No farm found" }, { status: 404 });

  const { data, error } = await svc
    .from("sensor_nodes")
    .upsert({ farm_id: farm.id, node_id: node_id.trim(), name: name?.trim() || "Sensor" }, { onConflict: "node_id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/nodes — remove a sensor node by id
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const svc = createServiceClient();

  // Verify ownership before deleting
  const { data: node } = await svc.from("sensor_nodes").select("farm_id").eq("id", id).single();
  if (!node) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: farm } = await svc.from("farms").select("id").eq("id", node.farm_id).eq("user_id", user.id).single();
  if (!farm) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await svc.from("sensor_nodes").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
