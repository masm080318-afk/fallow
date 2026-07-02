"use client";

import { useEffect, useState } from "react";
import { Sprout, Droplets, Radio, CircleHelp, ArrowRight } from "lucide-react";

const SLIDES = [
  {
    icon: Sprout,
    title: "Welcome to Soilify",
    text: "Your whole farm at a glance. Here's the 20-second tour — you can replay it anytime from Help.",
  },
  {
    icon: Droplets,
    title: "One answer, every morning",
    text: "The banner at the top tells you the only thing that matters: water today, or skip. We do the math from live weather and your soil.",
  },
  {
    icon: Radio,
    title: "Sensors report on their own",
    text: "Field sensors check in every 15 minutes. The gauge, charts and alerts update live — no refreshing, no buttons.",
  },
  {
    icon: CircleHelp,
    title: "Stuck? Help is one tap away",
    text: "Gateway setup steps, FAQs and this tour live behind the ? icon in the top bar.",
  },
];

const STORAGE_KEY = "soilify_tour_seen";

export default function WelcomeTour() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch { /* private mode — skip the tour */ }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setOpen(false);
  };

  if (!open) return null;

  const { icon: Icon, title, text } = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  return (
    <div
      className="tour-backdrop fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{
        background: "rgba(13,26,10,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome tour"
    >
      {/* key remounts the card per slide so the pop-in replays */}
      <div key={slide} className="tour-card w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl">

        {/* Animated icon */}
        <div className="relative w-16 h-16 mx-auto mb-5">
          <span className="tour-ring" />
          <span className="tour-ring" />
          <div
            className="relative w-16 h-16 rounded-full flex items-center justify-center animate-float"
            style={{
              background: "linear-gradient(135deg, #7dd44f, #4a8020)",
              boxShadow: "0 8px 24px rgba(92,158,42,0.35)",
            }}
          >
            <Icon size={28} color="#fff" />
          </div>
        </div>

        <h2 className="text-lg font-black mb-2">{title}</h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--muted)" }}>{text}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                background: i === slide ? "var(--green)" : "var(--border)",
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!isLast && (
            <button
              onClick={dismiss}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold !min-h-0 !bg-transparent !border-0"
              style={{ color: "var(--muted)" }}
            >
              Skip
            </button>
          )}
          <button
            onClick={() => (isLast ? dismiss() : setSlide((s) => s + 1))}
            className="btn-primary flex-1 !min-h-0 !py-2.5 text-sm"
          >
            {isLast ? "Show me my farm" : "Next"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
