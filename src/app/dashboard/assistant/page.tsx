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
      content: "Hey! I'm Soilify AI 🌱\n\nI can help with irrigation timing, plant health, soil questions, and more.\n\nYou can also send me a photo of your plants or soil and I'll analyze what I see.",
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
      <div
        className="px-4 py-4 flex items-center gap-3 border-b border-[var(--border)]"
        style={{ background: "linear-gradient(180deg, rgba(34,197,94,0.04) 0%, transparent 100%)" }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
            border: "1px solid rgba(34,197,94,0.25)",
            boxShadow: "0 0 16px rgba(34,197,94,0.15)",
          }}
        >
          <Sprout size={18} className="text-green" />
        </div>
        <div>
          <div className="font-bold text-sm text-gradient">Soilify AI</div>
          <div className="text-xs text-muted">Plant health · Soil advice · Irrigation</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green font-medium">
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
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <Sprout size={13} className="text-green" />
              </div>
            )}
            <div
              className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                m.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      color: "#052e16",
                      borderBottomRightRadius: 4,
                      fontWeight: 500,
                      boxShadow: "0 4px 16px rgba(34,197,94,0.2)",
                    }
                  : {
                      background: "linear-gradient(145deg, #161616, #121212)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderBottomLeftRadius: 4,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    }
              }
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="Uploaded"
                  className="rounded-xl mb-2 max-h-52 w-auto"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                />
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Sprout size={13} className="text-green" />
            </div>
            <div
              className="px-4 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(145deg, #161616, #121212)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderBottomLeftRadius: 4,
              }}
            >
              <Loader2 size={15} className="animate-spin text-muted" />
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
                className="text-xs px-3 py-2 rounded-full transition-all duration-200 !min-h-0 font-medium"
                style={{
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "var(--green)",
                  background: "rgba(34,197,94,0.05)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(34,197,94,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
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
              style={{ border: "1px solid rgba(34,197,94,0.3)", boxShadow: "0 0 12px rgba(34,197,94,0.15)" }}
            />
            <button
              onClick={() => setImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center !min-h-0 !p-0"
              style={{ background: "var(--red)", border: "1.5px solid var(--background)" }}
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
          style={{
            background: "linear-gradient(145deg, #141414, #111)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <button
            onClick={() => fileRef.current?.click()}
            className="text-muted hover:text-green transition-all duration-200 !min-h-0 !p-1.5 !bg-transparent !border-0 shrink-0 hover:scale-110"
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
            className="shrink-0 !min-h-0 !p-2 !border-0 rounded-xl transition-all duration-200 disabled:opacity-30"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: loading || (!input.trim() && !image) ? "none" : "0 0 12px rgba(34,197,94,0.4)",
            }}
          >
            <Send size={15} className="text-[#052e16]" />
          </button>
        </div>
        <p className="text-center text-xs text-muted mt-2" style={{ fontSize: 10 }}>
          Tap <ImagePlus size={9} className="inline" /> to send a plant photo for health analysis
        </p>
      </div>
    </main>
  );
}
