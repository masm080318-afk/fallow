"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades + lifts its children in when scrolled into view (design's data-reveal).
 *
 * Fails OPEN: if IntersectionObserver is unavailable or never fires (zero-size
 * viewports, embedded renderers, odd browsers), a safety timer reveals the
 * content anyway. Content must never be permanently invisible.
 */
export default function Reveal({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setShown(true), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);

    // Safety net — reveal regardless if the observer never reports.
    const safety = setTimeout(() => setShown(true), 1500);

    return () => {
      clearTimeout(safety);
      io.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`lp-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
