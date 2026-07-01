import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calculateET0, type WeatherInput } from "@/lib/et/penman-monteith";
import { getKc } from "@/lib/et/crop-coefficients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: farm } = await supabase
    .from("farms")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!farm) return NextResponse.json({ error: "No farm" }, { status: 404 });
  if (!farm.latitude || !farm.longitude) {
    return NextResponse.json({ error: "No location set. Add your farm location in Settings." }, { status: 422 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const svc = createServiceClient();

  // Return cached weather/ET result if already calculated today,
  // but always recompute the recommendation from the latest sensor reading.
  const { data: cached } = await svc
    .from("et_readings")
    .select("*")
    .eq("farm_id", farm.id)
    .eq("date", today)
    .maybeSingle();

  if (cached) {
    const { data: freshReading } = await svc
      .from("readings")
      .select("moisture_percent")
      .eq("farm_id", farm.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (freshReading?.moisture_percent !== null && freshReading?.moisture_percent !== undefined) {
      const moisture = freshReading.moisture_percent as number;
      const waterNeeded = cached.etc_mm - cached.precipitation_mm;
      let recommend: "water" | "skip" | "unknown" = "unknown";
      let recommend_mm: number | null = null;
      let recommend_reason = "";

      if (moisture < 30 || (moisture < 50 && waterNeeded > 3)) {
        recommend = "water";
        recommend_mm = Math.max(0, Math.round(waterNeeded * 10) / 10);
        recommend_reason = moisture < 30
          ? `Soil is dry (${moisture}%) and crop needs ${cached.etc_mm} mm today`
          : `Soil at ${moisture}% — net ET demand is ${waterNeeded.toFixed(1)} mm after ${cached.precipitation_mm} mm rain`;
      } else {
        recommend = "skip";
        recommend_reason = moisture >= 50
          ? `Soil moisture is sufficient (${moisture}%)`
          : `ET demand (${waterNeeded.toFixed(1)} mm net) is low enough to skip today`;
      }

      return NextResponse.json({ ...cached, recommend, recommend_mm, recommend_reason });
    }

    return NextResponse.json(cached);
  }

  // Fetch today's weather from Open-Meteo (no API key needed)
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${farm.latitude}&longitude=${farm.longitude}&daily=temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,relative_humidity_2m_min,wind_speed_10m_max,shortwave_radiation_sum,precipitation_sum&wind_speed_unit=ms&timezone=auto&forecast_days=1`;

  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    return NextResponse.json({ error: "Weather API unavailable" }, { status: 502 });
  }
  const weather = await weatherRes.json();
  const d = weather.daily;

  const tMax: number  = d.temperature_2m_max[0];
  const tMin: number  = d.temperature_2m_min[0];
  const rhMax: number = d.relative_humidity_2m_max[0];
  const rhMin: number = d.relative_humidity_2m_min[0];
  const u10: number   = d.wind_speed_10m_max[0];
  const Rs: number    = d.shortwave_radiation_sum[0]; // MJ/m²/day
  const precip: number = d.precipitation_sum[0] ?? 0;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);

  const input: WeatherInput = {
    tMax, tMin, rhMax, rhMin, u10, Rs,
    latitude: farm.latitude,
    elevation: farm.elevation ?? 0,
    dayOfYear,
  };

  const result = calculateET0(input);
  const kc = getKc(farm.crop_type ?? "garden");
  const etc = Math.round(result.et0 * kc * 100) / 100;

  // Watering recommendation
  // ETc = water the crop needs today (mm)
  // If soil moisture is low OR ETc is high, recommend watering
  const { data: latestReading } = await svc
    .from("readings")
    .select("moisture_percent")
    .eq("farm_id", farm.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const moisture = latestReading?.moisture_percent ?? null;
  let recommend: "water" | "skip" | "unknown" = "unknown";
  let recommendMm: number | null = null;
  let recommendReason = "";

  if (moisture !== null) {
    const waterNeeded = etc - precip; // net water need after rain
    if (moisture < 30 || (moisture < 50 && waterNeeded > 3)) {
      recommend = "water";
      recommendMm = Math.max(0, Math.round(waterNeeded * 10) / 10);
      recommendReason = moisture < 30
        ? `Soil is dry (${moisture}%) and crop needs ${etc} mm today`
        : `Soil at ${moisture}% — net ET demand is ${waterNeeded.toFixed(1)} mm after ${precip} mm rain`;
    } else {
      recommend = "skip";
      recommendReason = moisture >= 50
        ? `Soil moisture is sufficient (${moisture}%)`
        : `ET demand (${waterNeeded.toFixed(1)} mm net) is low enough to skip today`;
    }
  }

  // Store result
  const row = {
    farm_id: farm.id,
    date: today,
    et0_mm: result.et0,
    etc_mm: etc,
    kc,
    temp_max_c: tMax,
    temp_min_c: tMin,
    humidity_pct: (rhMax + rhMin) / 2,
    wind_speed_ms: result.u2,
    solar_radiation: Rs,
    precipitation_mm: precip,
    recommend,
    recommend_mm: recommendMm,
    recommend_reason: recommendReason,
    vpd: result.vpd,
    rn: result.Rn,
  };

  const { data: saved, error: saveErr } = await svc
    .from("et_readings")
    .upsert(row, { onConflict: "farm_id,date" })
    .select()
    .single();

  if (saveErr) {
    // Return calculated result even if save fails
    return NextResponse.json({ ...row, save_error: saveErr.message });
  }

  return NextResponse.json(saved);
}
