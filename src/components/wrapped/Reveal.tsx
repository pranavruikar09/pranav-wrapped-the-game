import type { ReactNode } from "react";
import { useReveal } from "./useReveal";

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "p" | "h2";
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`${className} transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        shown ? "translate-y-0 opacity-100 blur-0" : "translate-y-8 opacity-0 blur-[3px]"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export function ChapterTag({ chapter, move }: { chapter: string; move: string }) {
  return (
    <Reveal className="flex items-center gap-3">
      <span className="h-px w-8 bg-accent" />
      <span className="font-mono text-sm tracking-[0.3em] text-accent">{chapter}</span>
      <span className="font-mono text-sm tracking-[0.3em] text-muted-foreground">{move}</span>
    </Reveal>
  );
}
