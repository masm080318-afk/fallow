"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `to` when scrolled into view (design's [data-count] behaviour).
 *
 * Fails OPEN: renders the final value during SSR and for reduced-motion users,
 * and a safety timer snaps to the final value if IntersectionObserver never
 * fires — so the number is never left showing 0.
 */
export default function CountUp({
  to,
  decimals = 0,
  className,
  style,
}: {
  to: number;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);
  const settled = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return; // stays at `to`

    let raf = 0;
    setValue(0);

    const run = () => {
      if (settled.current) return;
      settled.current = true;
      const duration = 1300;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(to * eased);
        if (p < 1) raf = requestAnimationFrame(tick);
        else setValue(to);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(el);

    // Safety net — never leave the number sitting at 0.
    const safety = setTimeout(() => {
      if (!settled.current) {
        settled.current = true;
        setValue(to);
      }
    }, 2000);

    return () => {
      clearTimeout(safety);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [to]);

  return (
    <span ref={ref} className={className} style={style}>
      {value.toFixed(decimals)}
    </span>
  );
}
