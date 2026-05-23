import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AlertBody {
  farm_id?: string;
  moisture?: number;
  test?: boolean;
}

export async function POST(request: Request) {
  let body: AlertBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isTest = body.test === true;

  // For test mode, use authenticated session; for sensor-driven alerts use service client + farm_id.
  let farmId = body.farm_id;
  let svc;

  if (isTest) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: farm } = await supabase
      .from("farms")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });
    farmId = farm.id;
    svc = createServiceClient();
  } else {
    if (!farmId)
      return NextResponse.json({ error: "Missing farm_id" }, { status: 400 });
    svc = createServiceClient();
  }

  const { data: farm } = await svc
    .from("farms")
    .select("*")
    .eq("id", farmId)
    .single();

  if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });

  if (!isTest && farm.alerts_enabled === false) {
    return NextResponse.json({ skipped: "alerts_disabled" });
  }

  if (!farm.phone) {
    return NextResponse.json(
      { error: "No phone number on file" },
      { status: 400 }
    );
  }

  // Throttle: skip if alert sent within alert_frequency_hours (except test).
  if (!isTest) {
    const since = new Date(
      Date.now() - farm.alert_frequency_hours * 3600 * 1000
    ).toISOString();
    const { data: recent } = await svc
      .from("alerts_log")
      .select("id")
      .eq("farm_id", farm.id)
      .eq("alert_type", "low_moisture")
      .gte("sent_at", since)
      .limit(1);
    if (recent && recent.length > 0) {
      return NextResponse.json({ skipped: "throttled" });
    }
  }

  const moisture = body.moisture ?? 0;
  const message = isTest
    ? `Fallow test alert: SMS notifications are working for ${farm.name}.`
    : `Fallow alert: ${farm.name} soil moisture is ${moisture}% (below your ${farm.alert_threshold}% threshold). Consider watering soon.`;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM ?? process.env.TWILIO_PHONE_NUMBER;

  // Log the attempt first so throttling works even if SMS fails.
  if (!isTest) {
    await svc.from("alerts_log").insert({
      farm_id: farm.id,
      alert_type: "low_moisture",
      moisture_at_alert: moisture,
    });
  }

  let smsSent = false;
  if (
    sid &&
    token &&
    from &&
    !sid.startsWith("YOUR_") &&
    !token.startsWith("YOUR_") &&
    !from.includes("XXXX")
  ) {
    try {
      const client = twilio(sid, token);
      await client.messages.create({ from, to: farm.phone, body: message });
      smsSent = true;
    } catch (e) {
      console.error("Twilio error:", e);
      return NextResponse.json({ error: "SMS send failed" }, { status: 502 });
    }
  } else {
    console.log("[DEV] Twilio not configured. Would send SMS:", message);
  }

  if (isTest) {
    await svc.from("alerts_log").insert({
      farm_id: farm.id,
      alert_type: "test",
      moisture_at_alert: null,
    });
  }

  return NextResponse.json({ ok: true, sms_sent: smsSent, message });
}
