import { useEffect, useRef, useState } from "react";

/**
 * Sibling to useReveal, but triggers on scroll-into-view rather than mount —
 * for the one chapter (Wrapped) that is an internally scrolling stack of
 * cards instead of a fixed slide, where every card mounts at once and a
 * mount-triggered reveal would just fire them all immediately.
 *
 * IntersectionObserver is the primary trigger, but it's backed by a manual
 * getBoundingClientRect check on scroll/resize (window-level, capture phase,
 * so it still catches scroll events from the internal overflow-y-auto pane,
 * which don't bubble). Same defensive reasoning as useReveal's rAF+setTimeout
 * pairing: a backgrounded/non-composited tab can leave IntersectionObserver
 * silently inert, which would otherwise strand cards at opacity-0 forever.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setShown(true);
    };

    const checkPosition = () => {
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) reveal();
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) reveal();
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
      );
      observer.observe(el);
    }

    window.addEventListener("scroll", checkPosition, { capture: true, passive: true });
    window.addEventListener("resize", checkPosition);
    checkPosition();
    const timeout = window.setTimeout(checkPosition, 300);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", checkPosition, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", checkPosition);
      window.clearTimeout(timeout);
    };
  }, []);

  return { ref, shown };
}
