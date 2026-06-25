import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AlertBody {
  farm_id?: string;
  moisture?: number;
  test?: boolean;
  alert_type?: "low_moisture" | "frost";
}

function fetchWithTimeout(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

async function checkRainRecently(lat: number, lon: number): Promise<number> {
  try {
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    const res = await fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum&timezone=auto&start_date=${yesterday}&end_date=${today}`
    );
    const d = await res.json();
    return (d.daily?.precipitation_sum ?? []).reduce((a: number, b: number | null) => a + (b ?? 0), 0);
  } catch {
    return 0;
  }
}

async function sendSMS(phone: string, message: string): Promise<void> {
  const key = process.env.TEXTBELT_API_KEY;
  if (!key) throw new Error("TEXTBELT_API_KEY not set in environment variables.");

  const res = await fetch("https://textbelt.com/text", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ phone, message, key }),
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error ?? "TextBelt rejected the message.");
  }
}

export async function POST(request: Request) {
  let body: AlertBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const isTest = body.test === true;
  const alertType = body.alert_type ?? "low_moisture";
  let farmId = body.farm_id;
  let svc;

  if (isTest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: farm } = await supabase.from("farms").select("id").eq("user_id", user.id).single();
    if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });
    farmId = farm.id;
    svc = createServiceClient();
  } else {
    if (!farmId) return NextResponse.json({ error: "Missing farm_id" }, { status: 400 });
    svc = createServiceClient();
  }

  const { data: farm } = await svc.from("farms").select("*").eq("id", farmId).single();
  if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });

  if (!isTest && farm.alerts_enabled === false) {
    return NextResponse.json({ skipped: "alerts_disabled" });
  }

  if (!farm.phone) {
    return NextResponse.json({ error: "No phone number on file." }, { status: 400 });
  }

  // Throttle: skip if same alert type sent within alert_frequency_hours (except test)
  if (!isTest) {
    const since = new Date(Date.now() - farm.alert_frequency_hours * 3600 * 1000).toISOString();
    const { data: recent } = await svc
      .from("alerts_log").select("id").eq("farm_id", farm.id)
      .eq("alert_type", alertType).gte("sent_at", since).limit(1);
    if (recent && recent.length > 0) return NextResponse.json({ skipped: "throttled" });
  }

  // Rain skip — if 5mm+ fell in last 24h, watering alert is unnecessary
  if (!isTest && alertType === "low_moisture" && farm.latitude && farm.longitude) {
    const rainMm = await checkRainRecently(farm.latitude, farm.longitude);
    if (rainMm >= 5) {
      return NextResponse.json({ skipped: "rain_detected", rain_mm: rainMm });
    }
  }

  const moisture = body.moisture ?? 0;
  let message: string;
  if (isTest) {
    message = `Soilify Labs test: SMS is working for ${farm.name}.`;
  } else if (alertType === "frost") {
    message = `Soilify Labs frost alert: Temp at ${farm.name} dropped to ${body.moisture}°F. Protect your crops!`;
  } else {
    message = `Soilify Labs: ${farm.name} soil moisture is ${moisture}% — below your ${farm.alert_threshold}% threshold. Time to water!`;
  }

  if (!isTest) {
    await svc.from("alerts_log").insert({
      farm_id: farm.id, alert_type: alertType,
      moisture_at_alert: alertType === "low_moisture" ? moisture : null,
    });
  }

  try {
    await sendSMS(farm.phone, message);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("TextBelt error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (isTest) {
    await svc.from("alerts_log").insert({ farm_id: farm.id, alert_type: "test", moisture_at_alert: null });
  }

  return NextResponse.json({ ok: true, message });
}
