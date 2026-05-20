import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { DiagnosisInput, DiagnosisStatus, DiagnosisConfidence } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DiagnosisBody {
  farm_id: string;
  node_id?: string;
  moisture: number;
  temperature: number;
  history?: { moisture: number; temperature: number; created_at: string }[];
}

function calcTrend(
  history: { moisture: number; created_at: string }[]
): number {
  // Simple slope: change per hour over the series
  if (history.length < 2) return 0;
  const sorted = [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const dtH =
    (new Date(last.created_at).getTime() -
      new Date(first.created_at).getTime()) /
    3_600_000;
  if (dtH <= 0) return 0;
  return (last.moisture - first.moisture) / dtH;
}

function fallbackDiagnosis(input: DiagnosisInput) {
  const { moisture, trend } = input;
  let status: DiagnosisStatus = "Healthy";
  let explanation = "Soil moisture looks comfortable for most crops.";
  let days_until_irrigation: number | null = 4;
  if (moisture < 25) {
    status = "Water Now";
    explanation = "Moisture is critically low. Water today to avoid stress.";
    days_until_irrigation = 0;
  } else if (moisture < 40) {
    status = "Water Soon";
    explanation =
      "Trending dry. Plan to water in the next day or two, ideally early morning.";
    days_until_irrigation = trend < -0.5 ? 1 : 2;
  } else {
    days_until_irrigation = Math.max(1, Math.round((moisture - 25) / 5));
  }
  return {
    status,
    explanation,
    confidence: "Medium" as DiagnosisConfidence,
    days_until_irrigation,
    best_watering_window: "5–7 AM",
  };
}

export async function POST(request: Request) {
  let body: DiagnosisBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    farm_id,
    node_id,
    moisture,
    temperature,
    history = [],
  } = body;

  if (!farm_id || moisture === undefined || temperature === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const trend = calcTrend(history);
  const hourOfDay = new Date().getHours();
  const input: DiagnosisInput = {
    moisture,
    temperature,
    history,
    trend,
    hourOfDay,
  };

  let parsed = fallbackDiagnosis(input);

  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "YOUR_ANTHROPIC_API_KEY_HERE") {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const userPrompt = `Sensor reading from a small farm:
- Current soil moisture: ${moisture}%
- Soil temperature: ${temperature}°F
- Moisture trend over last 24h: ${trend.toFixed(2)} %/hour
- Local hour of day: ${hourOfDay}
- Recent readings (oldest first): ${JSON.stringify(
        history.slice(-12).map((h) => ({
          m: h.moisture,
          t: h.temperature,
          at: h.created_at,
        }))
      )}

Respond ONLY with a single JSON object, no prose, with these exact keys:
{
  "status": "Healthy" | "Water Soon" | "Water Now",
  "explanation": string (2-3 casual sentences, like a friendly farmhand),
  "confidence": "High" | "Medium" | "Low",
  "days_until_irrigation": integer 0-14,
  "best_watering_window": string (e.g. "5-7 AM", "after sunset")
}`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 400,
        system:
          "You are an expert agricultural advisor helping small farmers interpret soil sensor data. Be practical, concise, and confident. Always respond with a single valid JSON object and nothing else.",
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        const match = textBlock.text.match(/\{[\s\S]*\}/);
        if (match) {
          const j = JSON.parse(match[0]);
          parsed = {
            status: j.status,
            explanation: j.explanation,
            confidence: j.confidence,
            days_until_irrigation: j.days_until_irrigation,
            best_watering_window: j.best_watering_window,
          };
        }
      }
    } catch (e) {
      console.error("Claude diagnose error:", e);
      // Stick with fallback.
    }
  }

  // Persist diagnosis using service client (caller may be unauthenticated webhook).
  try {
    const svc = createServiceClient();
    await svc.from("diagnoses").insert({
      farm_id,
      node_id: node_id ?? null,
      status: parsed.status,
      explanation: parsed.explanation,
      confidence: parsed.confidence,
      days_until_irrigation: parsed.days_until_irrigation,
      best_watering_window: parsed.best_watering_window,
    });
  } catch (e) {
    console.error("Diagnose persist error:", e);
  }

  return NextResponse.json(parsed);
}
