import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { name, email, farm_size, location, message } = await request.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { error } = await svc.from("preorders").insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    farm_size: farm_size || null,
    location: location || null,
    message: message || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
