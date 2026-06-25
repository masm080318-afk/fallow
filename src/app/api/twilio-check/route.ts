import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: farm } = await supabase.from("farms").select("phone").eq("user_id", user.id).single();

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM ?? process.env.TWILIO_PHONE_NUMBER;

  return NextResponse.json({
    twilio_sid_set:   !!sid,
    twilio_token_set: !!token,
    twilio_from:      from ?? null,
    farm_phone:       farm?.phone ?? null,
    sid_preview:      sid ? sid.slice(0, 6) + "…" : null,
  });
}
