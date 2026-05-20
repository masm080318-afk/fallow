import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const svc = createServiceClient();
  const { data: farm } = await svc
    .from("farms")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get latest reading for context
  const { data: latest } = farm
    ? await svc
        .from("readings")
        .select("*")
        .eq("farm_id", farm.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const body = await request.json();
  const { messages, image } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    image?: { base64: string; mediaType: string };
  };

  const farmContext = farm
    ? `The farmer's name is ${farm.name}. Current soil moisture: ${latest?.moisture_percent ?? "unknown"}%. Alert threshold: ${farm.alert_threshold}%.`
    : "No farm data available yet.";

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Build the last user message — optionally with an image
  const lastUserMessage = messages[messages.length - 1];
  const userContent: Anthropic.MessageParam["content"] = image
    ? [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: image.base64,
          },
        },
        { type: "text", text: lastUserMessage.content },
      ]
    : lastUserMessage.content;

  const anthropicMessages: Anthropic.MessageParam[] = [
    ...messages.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userContent },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `You are Fallow AI, a friendly farming and plant health assistant built into the Fallow soil monitoring app. You help small farmers make smart decisions about irrigation, plant health, and crop management.

${farmContext}

Your personality:
- Talk like a knowledgeable friend, not a textbook. Short, clear sentences.
- Give practical, actionable advice a farmer can act on today.
- When analyzing photos, be specific about what you see and what it means.
- You know about soil health, irrigation timing, plant diseases, nutrient deficiencies, pest identification, and general crop management.
- If moisture data is available, factor it into your advice.
- Always end with one clear next step the farmer should take.

When analyzing plant/soil photos:
- Identify visible symptoms (color, texture, spots, wilting, etc.)
- Give your best diagnosis of the problem
- Suggest treatment or action
- Mention if it looks healthy too — positive feedback matters`,
    messages: anthropicMessages,
  });

  const reply =
    response.content[0].type === "text" ? response.content[0].text : "";

  return NextResponse.json({ reply });
}
