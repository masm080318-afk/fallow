"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X, Sprout, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const SUGGESTIONS = [
  "Why is my moisture dropping fast?",
  "Best time to water today?",
  "Signs of overwatering?",
  "How to improve water retention?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi — I'm Soilify AI.\n\nI can help with irrigation timing, plant health, soil questions, and more.\n\nYou can also send me a photo of your plants or soil and I'll analyze what I see.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [meta, base64] = dataUrl.split(",");
      const mediaType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
      setImage({ base64, mediaType, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const send = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content && !image) return;

    const userMessage: Message = {
      role: "user",
      content: content || "What do you see in this image?",
      image: image?.preview,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    const sentImage = image;
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          image: sentImage ? { base64: sentImage.base64, mediaType: sentImage.mediaType } : undefined,
        }),
      });
      const json = await res.json();
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: json.reply ?? "Sorry, something went wrong.",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Network error. Please try again.",
      }]);
    }
    setLoading(false);
  };

  return (
    <main
      className="flex flex-col max-w-2xl mx-auto"
      style={{ height: "calc(100dvh - 118px)" }}
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="icon-chip" style={{ width: 40, height: 40 }}>
          <Sprout size={18} />
        </div>
        <div>
          <div className="card-title">Soilify AI</div>
          <div className="text-xs" style={{ color: "var(--ink-soft)" }}>Plant health · Soil advice · Irrigation</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs font-medium" style={{ color: "var(--accent)" }}>
          <span className="dot-online" style={{ width: 6, height: 6 }} />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 animate-fade-up ${m.role === "user" ? "justify-end" : "justify-start"}`}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            {m.role === "assistant" && (
              <div className="icon-chip mt-1" style={{ width: 28, height: 28 }}>
                <Sprout size={13} />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                m.role === "user"
                  ? {
                      background: "var(--accent)",
                      color: "#fff",
                      borderBottomRightRadius: 4,
                      fontWeight: 500,
                    }
                  : {
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderBottomLeftRadius: 4,
                    }
              }
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="Uploaded"
                  className="rounded-xl mb-2 max-h-52 w-auto"
                  style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                />
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="icon-chip" style={{ width: 28, height: 28 }}>
              <Sprout size={13} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderBottomLeftRadius: 4 }}
            >
              <Loader2 size={15} className="animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          </div>
        )}

        {/* Suggestion chips */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-2 rounded-full transition-colors !min-h-0 font-medium"
                style={{ border: "1px solid var(--border-strong)", color: "var(--accent)", background: "var(--surface)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {image && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={image.preview}
              alt="Preview"
              className="h-16 rounded-xl"
              style={{ border: "1px solid var(--border-strong)" }}
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center !min-h-0 !p-0"
              style={{ background: "var(--data-dry)", border: "1.5px solid var(--paper)" }}
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2.5"
          style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}
        >
          <button
            onClick={() => fileRef.current?.click()}
            className="transition-colors !min-h-0 !p-1.5 !bg-transparent !border-0 shrink-0"
            style={{ color: "var(--ink-soft)" }}
            title="Upload photo for analysis"
          >
            <ImagePlus size={19} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

          <textarea
            ref={textRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Ask anything about your farm…"
            rows={1}
            className="flex-1 resize-none text-sm focus:outline-none !min-h-0 !p-0 !bg-transparent !border-0"
            style={{ maxHeight: 120, lineHeight: "1.5" }}
          />

          <button
            onClick={() => send()}
            disabled={loading || (!input.trim() && !image)}
            className="shrink-0 !min-h-0 !p-2 !border-0 rounded-xl transition-opacity disabled:opacity-30"
            style={{ background: "var(--accent)" }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
          Tap the image icon to send a plant photo for health analysis
        </p>
      </div>
    </main>
  );
}
