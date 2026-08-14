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
    /**
     * Safety net: browsers pause rAF entirely for a backgrounded/non-composited
     * document, so an element that mounts while the tab isn't visible would
     * otherwise stay permanently un-revealed (`shown` never flips, so it's
     * stuck at its hidden opacity-0 state forever). setTimeout still fires
     * in the background — throttled, but it fires — so this guarantees the
     * element becomes visible either way. setShown is idempotent, so having
     * both race is harmless; rAF wins the common (visible-tab) case.
     */
    const timeout = window.setTimeout(() => setShown(true), 50);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, []);

  return { ref, shown };
}
