import type { ReactNode } from "react";
import { useScrollReveal } from "./useScrollReveal";

/** Scroll-triggered sibling of Reveal — same motion language, different trigger. */
export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, shown } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-10 opacity-0 blur-[3px]"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
