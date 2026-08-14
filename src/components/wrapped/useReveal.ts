import { useEffect, useRef, useState } from "react";

/**
 * Reveals children shortly after mount. Every chapter is a fixed, fully-visible
 * 100dvh slide now — nothing scrolls into view — so this is a mount-triggered
 * fade-in (one rAF, so the "hidden" state paints first and the transition runs),
 * not an IntersectionObserver. That also avoids a real bug: an observer-based
 * reveal on an element sitting near a clipped (`overflow-hidden`) chapter edge
 * can end up permanently un-triggered — clipped ancestors count toward
 * intersection, so a not-yet-shown element (translated off its final position)
 * can compute 0% visibility and never fire, leaving it invisible forever.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return { ref, shown };
}
