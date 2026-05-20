"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ImagePlus, X, Sprout, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string; // preview URL
}

const SUGGESTIONS = [
  "Why is my soil moisture dropping so fast?",
  "When is the best time to water my crops?",
  "What are signs of overwatering?",
  "How do I improve soil water retention?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm Fallow AI. I can help with irrigation timing, plant health, soil questions, and more. You can also send me a photo of your plants or soil and I'll tell you what I see. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<{
    base64: string;
    mediaType: string;
    preview: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          image: sentImage
            ? { base64: sentImage.base64, mediaType: sentImage.mediaType }
            : undefined,
        }),
      });

      const json = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.reply ?? "Sorry, I couldn't get a response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <main className="flex flex-col h-[calc(100vh-120px)] max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="py-4 border-b border-[var(--border)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-green/10 flex items-center justify-center">
          <Sprout size={18} className="text-green" />
        </div>
        <div>
          <div className="font-semibold text-sm">Fallow AI</div>
          <div className="text-xs text-muted">Plant health · Irrigation · Soil advice</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-green text-[#052e16] rounded-br-sm"
                  : "bg-[#141414] border border-[var(--border)] text-foreground rounded-bl-sm"
              }`}
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="Uploaded"
                  className="rounded-lg mb-2 max-h-48 w-auto"
                />
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#141414] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          </div>
        )}

        {/* Suggestion chips — only show at start */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 mt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-2 rounded-full border border-[var(--border)] text-muted hover:text-foreground hover:border-green transition-colors !min-h-0"
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
        <div className="relative inline-block mb-2 self-start">
          <img src={image.preview} alt="Preview" className="h-16 rounded-lg" />
          <button
            onClick={() => setImage(null)}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red rounded-full flex items-center justify-center !min-h-0 !p-0"
          >
            <X size={10} className="text-white" />
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="py-3 border-t border-[var(--border)]">
        <div className="flex items-end gap-2 bg-[#141414] border border-[var(--border)] rounded-2xl px-3 py-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-muted hover:text-green transition-colors !min-h-0 !p-1 !bg-transparent !border-0 shrink-0"
            title="Upload a photo"
          >
            <ImagePlus size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImage}
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything about your farm..."
            rows={1}
            className="flex-1 bg-transparent border-0 resize-none text-sm focus:outline-none !min-h-0 !p-0 max-h-32"
          />
          <button
            onClick={() => send()}
            disabled={loading || (!input.trim() && !image)}
            className="shrink-0 !min-h-0 !p-1.5 !bg-green !border-0 rounded-xl disabled:opacity-40 transition-opacity"
          >
            <Send size={16} className="text-[#052e16]" />
          </button>
        </div>
        <p className="text-xs text-muted text-center mt-2">
          Tap <ImagePlus size={10} className="inline" /> to upload a plant or soil photo for analysis
        </p>
      </div>
    </main>
  );
}
