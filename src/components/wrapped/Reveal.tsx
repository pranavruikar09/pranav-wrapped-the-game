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
  const { ref, shown } = useReveal<HTMLDivElement>(0.15);
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

export function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-chapter-section
      className={`relative flex min-h-svh w-full flex-col justify-center px-6 py-24 sm:px-10 lg:px-20 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  );
}

export function ChapterTag({ chapter, move }: { chapter: string; move: string }) {
  return (
    <Reveal className="mb-8 flex items-center gap-4">
      <span className="h-px w-10 bg-accent" />
      <span className="font-mono text-[0.65rem] tracking-[0.35em] text-accent">{chapter}</span>
      <span className="font-mono text-[0.65rem] tracking-[0.35em] text-muted-foreground">
        {move}
      </span>
    </Reveal>
  );
}
