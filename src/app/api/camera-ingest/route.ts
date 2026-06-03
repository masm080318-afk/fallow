import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface CameraBody {
  device_id: string;   // sensor_nodes.id UUID
  image: string;       // base64-encoded JPEG
}

export async function POST(request: Request) {
  let body: CameraBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { device_id, image } = body;
  if (!device_id || !image) {
    return NextResponse.json({ error: "Missing device_id or image" }, { status: 400 });
  }

  const svc = createServiceClient();

  // Look up sensor node by UUID
  const { data: node } = await svc
    .from("sensor_nodes")
    .select("id, farm_id, name, node_id")
    .eq("id", device_id)
    .maybeSingle();

  if (!node) {
    return NextResponse.json(
      { error: "Unknown device_id. Register this camera in Settings first." },
      { status: 404 }
    );
  }

  // Get latest soil readings for context
  const { data: reading } = await svc
    .from("readings")
    .select("moisture_percent, temperature_f, created_at")
    .eq("farm_id", node.farm_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get 24h moisture trend
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: history } = await svc
    .from("readings")
    .select("moisture_percent, created_at")
    .eq("farm_id", node.farm_id)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  let trend = 0;
  if (history && history.length >= 2) {
    const first = history[0];
    const last = history[history.length - 1];
    const dtH = (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / 3_600_000;
    if (dtH > 0) trend = (last.moisture_percent - first.moisture_percent) / dtH;
  }

  const moisture = reading?.moisture_percent;
  const temp = reading?.temperature_f;

  type DiagnosisStatus = "Healthy" | "Water Soon" | "Water Now";
  type DiagnosisConfidence = "High" | "Medium" | "Low";

  let diagnosis: {
    status: DiagnosisStatus;
    explanation: string;
    confidence: DiagnosisConfidence;
    days_until_irrigation: number;
    best_watering_window: string;
  } | null = null;

  if (process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith("YOUR_")) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const soilContext = [
        moisture != null ? `Current soil moisture: ${moisture}%` : null,
        temp != null ? `Soil temperature: ${temp}°F` : null,
        `Moisture trend over 24h: ${trend.toFixed(2)}%/hour`,
      ].filter(Boolean).join(". ");

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 600,
        system:
          "You are an expert agricultural advisor analyzing crop photos combined with soil sensor data. " +
          "Examine the image carefully for visible signs of water stress (wilting, leaf curl, discoloration), " +
          "disease, pest damage, or nutrient deficiency. Cross-reference with the soil sensor readings. " +
          "Be specific and practical. Always respond with a single valid JSON object and nothing else.",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: image,
                },
              },
              {
                type: "text",
                text: `Analyze this crop photo from a farm sensor camera.
${soilContext ? `Soil sensor data: ${soilContext}.` : "No soil sensor data available."}

Look for visible symptoms in the plants — wilting, color changes, spotting, or healthy growth.
Combine what you see visually with the sensor data to give the most accurate recommendation.

Respond ONLY with this JSON:
{
  "status": "Healthy" | "Water Soon" | "Water Now",
  "explanation": "2-3 sentences combining what you see visually AND the sensor data",
  "confidence": "High" | "Medium" | "Low",
  "days_until_irrigation": integer 0-14,
  "best_watering_window": "e.g. 5-7 AM"
}`,
              },
            ],
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        const match = textBlock.text.match(/\{[\s\S]*\}/);
        if (match) {
          const j = JSON.parse(match[0]);
          diagnosis = {
            status: j.status,
            explanation: j.explanation,
            confidence: j.confidence,
            days_until_irrigation: j.days_until_irrigation,
            best_watering_window: j.best_watering_window,
          };
        }
      }
    } catch (e) {
      console.error("Claude camera error:", e);
    }
  }

  // Fallback if no API key or Claude failed
  if (!diagnosis) {
    diagnosis = {
      status: "Healthy",
      explanation: "Camera image received. Add your Anthropic API key to Vercel to enable visual AI analysis.",
      confidence: "Low",
      days_until_irrigation: 3,
      best_watering_window: "5–7 AM",
    };
  }

  // Save diagnosis
  const { data: saved } = await svc
    .from("diagnoses")
    .insert({
      farm_id: node.farm_id,
      node_id: node.node_id,
      status: diagnosis.status,
      explanation: `📷 ${diagnosis.explanation}`,
      confidence: diagnosis.confidence,
      days_until_irrigation: diagnosis.days_until_irrigation,
      best_watering_window: diagnosis.best_watering_window,
    })
    .select()
    .single();

  return NextResponse.json({ ...diagnosis, id: saved?.id });
}
