/**
 * Chapter progress indicator: a visual "where am I" marker, not a nav menu.
 * `chapterIndex` is the chapter the viewer is currently in (or heading to,
 * during a chess move transition).
 */
export function ProgressRail({
  chapterIndex,
  labels,
}: {
  chapterIndex: number;
  labels: readonly string[];
}) {
  const clamped = Math.max(0, chapterIndex);
  return (
    <>
      <div className="fixed left-0 top-0 z-40 h-[3px] w-full bg-border/40">
        <div
          className="h-full bg-accent transition-[width] duration-500"
          style={{ width: `${((clamped + 1) / labels.length) * 100}%` }}
        />
      </div>

      {/* Desktop: vertical rail */}
      <div aria-label="Story progress" className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center justify-end gap-3">
            <span
              className={`font-mono text-[0.6rem] tracking-[0.3em] transition-all ${
                i === chapterIndex ? "text-accent" : "text-muted-foreground opacity-40"
              }`}
            >
              {label}
            </span>
            <span
              className={`h-px transition-all duration-500 ${
                i === chapterIndex ? "w-10 bg-accent" : "w-4 bg-muted-foreground/50"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Mobile: bottom chapter chip */}
      <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-border bg-card/90 px-4 py-2 backdrop-blur lg:hidden">
        <span className="font-mono text-[0.6rem] tracking-[0.3em] text-accent">
          {labels[clamped]}
        </span>
      </div>
    </>
  );
}

export function Loader({ done }: { done: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[60] grid place-items-center bg-background transition-opacity duration-700 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center">
        <div className="flex justify-center gap-1 text-3xl text-accent">
          {["♟", "♞", "♝", "♜", "♛", "♚"].map((g, i) => (
            <span
              key={g}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 110}ms`, animationFillMode: "backwards" }}
            >
              {g}
            </span>
          ))}
        </div>
        <p className="mt-6 font-mono text-[0.6rem] tracking-[0.4em] text-muted-foreground">
          SETTING UP THE BOARD
        </p>
      </div>
    </div>
  );
}
