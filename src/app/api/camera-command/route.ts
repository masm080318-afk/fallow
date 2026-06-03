import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST — app requests an on-demand photo from the ESP32-CAM
export async function POST(request: Request) {
  // Auth: accept cookie session (web) or Bearer token (mobile)
  const svc = createServiceClient();
  let userId: string | null = null;

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const { data: { user } } = await svc.auth.getUser(auth.slice(7));
    userId = user?.id ?? null;
  } else {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { farm_id } = await request.json();
  if (!farm_id) return NextResponse.json({ error: "farm_id required" }, { status: 400 });

  // Verify ownership
  const { data: farm } = await svc.from("farms").select("id").eq("id", farm_id).eq("user_id", userId).single();
  if (!farm) return NextResponse.json({ error: "Farm not found" }, { status: 404 });

  await svc.from("farms").update({ pending_capture: true }).eq("id", farm_id);

  return NextResponse.json({ ok: true, message: "Photo requested — camera will capture within 30 seconds." });
}
