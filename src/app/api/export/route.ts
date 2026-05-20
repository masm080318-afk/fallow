import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: farm } = await supabase
    .from("farms")
    .select("id, name")
    .eq("user_id", user.id)
    .single();
  if (!farm) {
    return NextResponse.json({ error: "No farm" }, { status: 404 });
  }

  const { data: readings, error } = await supabase
    .from("readings")
    .select("created_at, node_id, moisture_percent, temperature_f, raw_value")
    .eq("farm_id", farm.id)
    .order("created_at", { ascending: false })
    .limit(10_000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = "timestamp,node_id,moisture_percent,temperature_f,raw_value";
  const rows = (readings ?? []).map((r) =>
    [
      r.created_at,
      r.node_id,
      r.moisture_percent,
      r.temperature_f,
      r.raw_value ?? "",
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");

  const safeName = farm.name.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fallow_${safeName}_${date}.csv"`,
    },
  });
}
