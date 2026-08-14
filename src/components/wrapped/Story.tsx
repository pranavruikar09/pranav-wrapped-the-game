import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { content, type WrappedCard as WrappedCardData } from "@/content/cv";
import { Chessboard } from "./Chessboard";
import { MOVES, applyMove, positionAfter, type Piece } from "./chess";
import { ChapterLayout } from "./ChapterLayout";
import { PhotoSlot } from "./PhotoSlot";
import { ChapterTag, Reveal } from "./Reveal";
import { ScrollReveal } from "./ScrollReveal";
import { Loader, ProgressRail, SoundToggle } from "./Chrome";
import { playTick, setSoundEnabled } from "./sound";

type ChapterId =
  | "player"
  | "passions"
  | "beauty"
  | "loreal"
  | "blunder"
  | "wrapped"
  | "endgame";

/** Chapter order. Index i is entered by playing MOVES[i]. */
const CHAPTER_ORDER: ChapterId[] = [
  "player",
  "passions",
  "beauty",
  "loreal",
  "blunder",
  "wrapped",
  "endgame",
];

const CHAPTER_LABELS = [
  "01 PLAYER",
  "02 PASSIONS",
  "03 BEAUTY",
  "04 MATCH",
  "05 ANALYSIS",
  "06 WRAPPED",
  "07 ENDGAME",
];

/** Chessboard sizing shared by every full-screen state — bounded by both
 *  viewport axes so it can never push surrounding text out of the viewport. */
const BOARD_SIZE_LG = "min(40dvh, 44vw, 19rem)";
const BOARD_SIZE_SM = "min(34dvh, 40vw, 15rem)";
/** The chess move transition is the board's big moment — noticeably larger than
 * elsewhere, still bounded by both axes so it never forces a scrollbar. */
const BOARD_SIZE_TRANSITION = "min(58dvh, 46vw, 40rem)";

type View =
  | { kind: "intro" }
  | { kind: "move"; moveIndex: number }
  | { kind: "chapter"; index: number };

export function Story() {
  const [loaded, setLoaded] = useState(false);
  const [sound, setSound] = useState(false);
  const [view, setView] = useState<View>({ kind: "intro" });
  const [movesPlayed, setMovesPlayed] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1100);
    return () => clearTimeout(t);
  }, []);

  /** The persistent board position. Only advances once a move animation completes. */
  const pieces = useMemo(() => positionAfter(movesPlayed), [movesPlayed]);

  const toggleSound = useCallback(() => {
    setSound((s) => {
      const next = !s;
      setSoundEnabled(next);
      if (next) playTick(440);
      return next;
    });
  }, []);

  const start = useCallback(() => {
    playTick(300);
    setView({ kind: "move", moveIndex: 0 });
  }, []);

  /** Called once a chess move's animation has finished playing. */
  const completeMove = useCallback((moveIndex: number) => {
    setMovesPlayed(moveIndex + 1);
    setView({ kind: "chapter", index: moveIndex });
  }, []);

  const goToNextMove = useCallback((fromChapterIndex: number) => {
    setView({ kind: "move", moveIndex: fromChapterIndex + 1 });
  }, []);

  /**
   * Step back one chapter, rewinding the board by exactly one move so the
   * position always matches the chapter you land on. On chapter i the board
   * has `i + 1` moves played, so chapter i-1 needs `i`.
   */
  const goToPrevChapter = useCallback((fromChapterIndex: number) => {
    if (fromChapterIndex <= 0) {
      setMovesPlayed(0);
      setView({ kind: "intro" });
      return;
    }
    setMovesPlayed(fromChapterIndex);
    setView({ kind: "chapter", index: fromChapterIndex - 1 });
  }, []);

  /**
   * Back out of a move transition. The move hasn't been played yet, so
   * `movesPlayed` is already correct for the chapter we return to.
   */
  const goBackFromMove = useCallback((moveIndex: number) => {
    if (moveIndex <= 0) {
      setView({ kind: "intro" });
      return;
    }
    setView({ kind: "chapter", index: moveIndex - 1 });
  }, []);

  const replay = useCallback(() => {
    setMovesPlayed(0);
    setView({ kind: "intro" });
  }, []);

  const progressIndex =
    view.kind === "chapter" ? view.index : view.kind === "move" ? view.moveIndex : -1;

  return (
    <>
      <Loader done={loaded} />
      <SoundToggle on={sound} onToggle={toggleSound} />
      {view.kind !== "intro" ? (
        <ProgressRail chapterIndex={progressIndex} labels={CHAPTER_LABELS} />
      ) : null}

      {view.kind === "intro" ? <Opening onStart={start} /> : null}

      {view.kind === "move" ? (
        <ChessMoveTransition
          key={view.moveIndex}
          moveIndex={view.moveIndex}
          basePieces={pieces}
          onComplete={() => completeMove(view.moveIndex)}
          onBack={() => goBackFromMove(view.moveIndex)}
        />
      ) : null}

      {view.kind === "chapter" ? (
        <ChapterScreen
          key={CHAPTER_ORDER[view.index]}
          id={CHAPTER_ORDER[view.index]!}
          pieces={pieces}
          onNext={() => goToNextMove(view.index)}
          onPrev={() => goToPrevChapter(view.index)}
          onReplay={replay}
        />
      ) : null}
    </>
  );
}

function ChapterScreen({
  id,
  pieces,
  onNext,
  onPrev,
  onReplay,
}: {
  id: ChapterId;
  pieces: Piece[];
  onNext: () => void;
  onPrev: () => void;
  onReplay: () => void;
}) {
  switch (id) {
    case "player":
      return <Player onNext={onNext} onPrev={onPrev} />;
    case "passions":
      return <Passions onNext={onNext} onPrev={onPrev} />;
    case "beauty":
      return <Beauty onNext={onNext} onPrev={onPrev} />;
    case "loreal":
      return <Loreal onNext={onNext} onPrev={onPrev} />;
    case "blunder":
      return <Blunder onNext={onNext} onPrev={onPrev} />;
    case "wrapped":
      return <Wrapped onNext={onNext} onPrev={onPrev} />;
    case "endgame":
      return <Endgame pieces={pieces} onPrev={onPrev} onReplay={onReplay} />;
  }
}

/* ─────────────────────────── OPENING SCREEN ─────────────────────────── */

function Opening({ onStart }: { onStart: () => void }) {
  const lines = [
    "EVERY GAME STARTS WITH A POSITION.",
    "So does every life.",
    "The interesting part is what you do with the next move.",
  ];
  return (
    <main className="relative grid h-dvh max-h-dvh w-full place-items-center overflow-hidden px-6 py-6">
      <div className="grain pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative flex max-h-full flex-col items-center overflow-hidden text-center">
        <Chessboard pieces={positionAfter(0)} size={BOARD_SIZE_LG} className="animate-scale-in" />
        <div className="mt-5 max-w-xl space-y-2">
          {lines.map((l, i) => (
            <p
              key={l}
              className={`animate-fade-in ${
                i === 0
                  ? "font-display text-[clamp(1.5rem,4.5vw,2.5rem)] uppercase leading-tight"
                  : "text-sm text-muted-foreground sm:text-base"
              }`}
              style={{ animationDelay: `${500 + i * 550}ms`, animationFillMode: "backwards" }}
            >
              {l}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-5 animate-fade-in rounded-full bg-accent px-8 py-3 font-display text-base uppercase tracking-wide text-accent-foreground transition-transform duration-300 hover:scale-105"
          style={{ animationDelay: "2100ms", animationFillMode: "backwards" }}
        >
          ▶ Start game
        </button>
        <p
          className="mt-4 animate-fade-in font-mono text-sm tracking-[0.3em] text-muted-foreground"
          style={{ animationDelay: "2500ms", animationFillMode: "backwards" }}
        >
          {content.subtitle}
        </p>
      </div>
    </main>
  );
}

/* ─────────────────────────── CHESS MOVE TRANSITION ─────────────────────────── */

function ChessMoveTransition({
  moveIndex,
  basePieces,
  onComplete,
  onBack,
}: {
  moveIndex: number;
  basePieces: Piece[];
  onComplete: () => void;
  onBack: () => void;
}) {
  const move = MOVES[moveIndex]!;
  const [played, setPlayed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const pieces = played ? applyMove(basePieces, move) : basePieces;
  const isFinalMove = moveIndex === MOVES.length - 1;

  const handlePlay = useCallback(() => {
    setPlayed((already) => {
      if (already) return already;
      playTick(360);
      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(onComplete, 320);
      }, 950);
      return true;
    });
  }, [onComplete]);

  return (
    <main
      className={`relative grid h-dvh max-h-dvh w-full place-items-center overflow-hidden px-6 py-4 transition-opacity duration-300 ${
        leaving ? "opacity-0" : "animate-fade-in opacity-100"
      }`}
    >
      <div className="grain pointer-events-none absolute inset-0 opacity-30" aria-hidden />

      {/* The transition centres a single column, so the back control is pinned
          bottom-left to stay symmetrical with the chapters' Previous move. */}
      {!played ? (
        <div className="absolute bottom-6 left-6 z-10">
          <PrevMoveButton onClick={onBack} />
        </div>
      ) : null}

      <div className="relative flex max-h-full flex-col items-center overflow-hidden text-center">
        <p className="font-mono text-sm tracking-[0.35em] text-accent">
          MOVE {String(moveIndex + 1).padStart(2, "0")} OF {String(MOVES.length).padStart(2, "0")}
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,4.5vw,2.75rem)] uppercase leading-none">
          {played ? "Move played." : "Your move →"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground sm:text-base">{move.hint}</p>

        <Chessboard
          pieces={pieces}
          move={played ? null : move}
          onPlay={handlePlay}
          dim={played}
          size={BOARD_SIZE_TRANSITION}
          className="mt-3"
        />

        <p className="mt-3 font-mono text-sm tracking-[0.25em] text-muted-foreground">
          {move.notation}
        </p>
        {!played ? (
          <>
            <p className="mt-1 font-mono text-sm tracking-[0.2em] text-muted-foreground/70">
              {isFinalMove
                ? "Click the glowing piece to reach the endgame."
                : "Click the glowing piece or square to play it."}
            </p>
            <button
              type="button"
              onClick={handlePlay}
              aria-label={`Play the next move: ${move.notation}`}
              className="mt-3 rounded-full border-2 border-accent/70 bg-accent/10 px-7 py-2.5 font-display text-sm uppercase tracking-wide text-accent transition-all hover:border-accent hover:bg-accent/20 hover:shadow-[0_0_28px_-6px_var(--accent)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-9 sm:py-3 sm:text-base"
            >
              {isFinalMove ? "Play the next move — endgame →" : "Play the next move →"}
            </button>
          </>
        ) : null}
      </div>
    </main>
  );
}

/** Chapter surface the move controls sit on — Beauty runs on cream. */
type MoveNavTone = "dark" | "cream";

/**
 * Bottom-left counterpart to the Next move CTA. Rendered as the quieter,
 * outlined twin so "back" never competes with "forward".
 */
function PrevMoveButton({
  onClick,
  tone = "dark",
}: {
  onClick: () => void;
  tone?: MoveNavTone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Go back to the previous move"
      className={`shrink-0 rounded-full border px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-7 sm:py-3 ${
        tone === "cream"
          ? "border-cream-foreground/40 text-cream-foreground/80 hover:border-cream-foreground hover:text-cream-foreground"
          : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
      }`}
    >
      ← Previous move
    </button>
  );
}

/** Shared call-to-action used in the footer of every non-final chapter. */
function NextMoveButton({
  onClick,
  tone = "dark",
}: {
  onClick: () => void;
  tone?: MoveNavTone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-7 sm:py-3 ${
        tone === "cream"
          ? "bg-cream-foreground text-cream"
          : "bg-accent text-accent-foreground"
      }`}
    >
      Next move →
    </button>
  );
}

/** Footer for chapters whose footer is nothing but the two move controls. */
function MoveNav({
  onPrev,
  onNext,
  tone = "dark",
}: {
  onPrev: () => void;
  onNext: () => void;
  tone?: MoveNavTone;
}) {
  return (
    <Reveal delay={200} className="flex items-center justify-between gap-3">
      <PrevMoveButton onClick={onPrev} tone={tone} />
      <NextMoveButton onClick={onNext} tone={tone} />
    </Reveal>
  );
}

/* ─────────────────────────── 01 THE PLAYER ─────────────────────────── */

type JourneyEntry = (typeof content.intro.journey)[number];

/** Hand-placed (x%, y%) position of each journey entry, in the same order as
 * `content.intro.journey`. Presentation only — the facts live in cv.ts. */
const JOURNEY_LAYOUT: { x: number; y: number }[] = [
  { x: 4, y: 6 }, // 0 Salwadgaon — start
  { x: 22, y: 20 }, // 1 Ahmednagar
  { x: 4, y: 40 }, // 2 Shevgaon
  { x: 17, y: 58 }, // 3 School — House Captain (sub)
  { x: 32, y: 66 }, // 4 School — Head Boy (sub)
  { x: 36, y: 40 }, // 5 Pune — JEE prep
  { x: 50, y: 16 }, // 6 JEE — blunder
  { x: 54, y: 58 }, // 7 Karad
  { x: 45, y: 78 }, // 8 Karad — Robotics (sub)
  { x: 62, y: 84 }, // 9 Karad — Indoor Games (sub)
  { x: 74, y: 38 }, // 10 Pune — first job
  { x: 92, y: 14 }, // 11 CAT — blunder
  { x: 90, y: 60 }, // 12 Mumbai — current
];
/** Indices, in path order, that form the main route. Sub/blunder entries branch off it instead. */
const JOURNEY_MAIN_PATH = [0, 1, 2, 5, 7, 10, 12];
/** [parentIndex, childIndex] — every non-main-path node branches off one neighbour. */
const JOURNEY_BRANCHES: [number, number][] = [
  [2, 3],
  [3, 4],
  [5, 6],
  [7, 8],
  [8, 9],
  [10, 11],
];
/** For a given active node, which edges (as "a-b" keys) should highlight. */
function activeEdgeKeys(active: number): Set<string> {
  const keys = new Set<string>();
  const mainPos = JOURNEY_MAIN_PATH.indexOf(active);
  if (mainPos !== -1) {
    if (mainPos > 0) keys.add(`${JOURNEY_MAIN_PATH[mainPos - 1]}-${active}`);
    if (mainPos < JOURNEY_MAIN_PATH.length - 1) keys.add(`${active}-${JOURNEY_MAIN_PATH[mainPos + 1]}`);
  }
  for (const [a, b] of JOURNEY_BRANCHES) {
    if (a === active || b === active) keys.add(`${a}-${b}`);
  }
  return keys;
}

/**
 * Smart-positions a floating panel next to (x%, y%) so it stays inside the
 * journey box. Three horizontal zones (not just left/right of centre) —
 * narrow mobile containers mean even a "centre" node needs the panel
 * centred on it rather than shoved fully to one side, or it clips the edge.
 */
function panelStyle(pos: { x: number; y: number }): CSSProperties {
  const goAbove = pos.y > 62;
  const nearTop = pos.y < 18;
  const ty = goAbove ? "calc(-100% - 10px)" : nearTop ? "10px" : "-50%";

  let tx: string;
  if (pos.x < 32) tx = "14px";
  else if (pos.x > 68) tx = "calc(-100% - 14px)";
  else tx = "-50%";

  return { left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(${tx}, ${ty})` };
}

function Journey({
  entries,
  active,
  onSelect,
}: {
  entries: JourneyEntry[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const c = content.intro;
  const milestone = entries[active]!;
  const activePos = JOURNEY_LAYOUT[active]!;
  const highlighted = useMemo(() => activeEdgeKeys(active), [active]);

  const edges: { a: number; b: number; kind: "blunder" | "sub" | "main" }[] = [
    ...JOURNEY_MAIN_PATH.slice(0, -1).map((a, i) => ({
      a,
      b: JOURNEY_MAIN_PATH[i + 1]!,
      kind: "main" as const,
    })),
    ...JOURNEY_BRANCHES.map(([a, b]) => ({
      a,
      b,
      kind: entries[b]!.kind === "blunder" ? ("blunder" as const) : ("sub" as const),
    })),
  ];

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {edges.map(({ a, b, kind }) => {
          const p1 = JOURNEY_LAYOUT[a]!;
          const p2 = JOURNEY_LAYOUT[b]!;
          const isHot = highlighted.has(`${a}-${b}`);
          return (
            <line
              key={`${a}-${b}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={
                isHot
                  ? kind === "blunder"
                    ? "var(--color-destructive)"
                    : "var(--color-accent)"
                  : kind === "blunder"
                    ? "var(--color-destructive)"
                    : "var(--color-border)"
              }
              strokeOpacity={isHot ? 1 : kind === "main" ? 0.8 : 0.55}
              strokeWidth={isHot ? 0.7 : 0.45}
              strokeDasharray={kind === "main" ? undefined : "2,2"}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>

      {entries.map((entry, i) => {
        const pos = JOURNEY_LAYOUT[i]!;
        const isActive = i === active;
        const isBlunder = entry.kind === "blunder";
        const isCurrent = entry.kind === "current";
        const isSub = entry.kind === "sub";
        return (
          <button
            key={`${entry.year}-${entry.location}-${entry.label}`}
            type="button"
            onClick={() => onSelect(i)}
            onMouseEnter={() => onSelect(i)}
            aria-pressed={isActive}
            aria-label={`${entry.year} — ${entry.location}: ${entry.label}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center transition-transform ${
              isActive ? "z-10 scale-[1.15]" : isSub || isBlunder ? "opacity-80 hover:scale-105" : "hover:scale-105"
            } ${!isActive ? "opacity-90" : ""}`}
          >
            <span
              aria-hidden
              className={`grid place-items-center rounded-full border transition-colors ${
                isBlunder
                  ? "h-3 w-3 border-destructive bg-background text-destructive"
                  : isCurrent
                    ? "h-3.5 w-3.5 border-accent bg-accent"
                    : "h-2.5 w-2.5 border-foreground/50 bg-background"
              } ${isActive ? "ring-2 ring-accent/70" : ""}`}
            >
              {isBlunder ? <span className="text-[0.45rem] leading-none">✕</span> : null}
            </span>
            <span
              className={`font-mono text-[clamp(0.8125rem,1vw,1rem)] leading-tight ${
                isActive ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {entry.year}
            </span>
            <span
              className={`font-display text-[clamp(1rem,1.3vw,1.25rem)] uppercase leading-tight ${
                isActive ? "text-foreground" : "text-foreground/70"
              }`}
            >
              {entry.location}
            </span>
          </button>
        );
      })}

      {/* current-position photo, anchored near Mumbai — mobile/tablet only; desktop shows the
          portrait in its own column instead (see Player). */}
      <div
        style={{ left: `${JOURNEY_LAYOUT[12]!.x}%`, top: "94%" }}
        className="absolute w-14 -translate-x-1/2 -translate-y-1/2 sm:w-16 lg:hidden"
      >
        <PhotoSlot photo={{ label: c.portrait.label, src: c.portrait.src ?? "" }} />
      </div>

      {/* floating detail panel — spatially anchored to the active node, never at the bottom.
          Keyed by `active` so it fully remounts (not just re-styles) on selection change. */}
      <div
        key={active}
        style={panelStyle(activePos)}
        className="absolute z-20 w-44 max-w-[calc(100vw-2rem)] animate-fade-in rounded-xl border border-accent/40 bg-card/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:w-56 lg:w-60"
      >
        <p className="font-mono text-[0.7rem] tracking-[0.15em] text-accent">
          {milestone.year}
          {milestone.age ? ` · AGE ${milestone.age}` : ""}
        </p>
        <p className="mt-0.5 font-display text-base uppercase leading-tight text-foreground">
          {milestone.location}
        </p>
        <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">
          {milestone.label}
        </p>
        <p className="mt-1.5 text-[0.8rem] leading-snug text-foreground/85">{milestone.description}</p>
      </div>
    </div>
  );
}

/* ─────────────── trait cards + centered overlay ─────────────── */

const TRAIT_ICONS = ["🧭", "🧩", "🔍", "🌱"];

function TraitCard({
  trait,
  icon,
  active,
  onClick,
}: {
  trait: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition-all hover:-translate-y-0.5 sm:gap-3 sm:px-4 sm:py-4 ${
        active
          ? "border-accent bg-accent/15 shadow-[0_0_20px_-6px_var(--accent)]"
          : "border-border/80 bg-secondary hover:border-accent/50 hover:bg-secondary/80"
      }`}
    >
      <span className="text-lg sm:text-xl" aria-hidden>
        {icon}
      </span>
      <span
        className={`font-display text-sm uppercase leading-tight tracking-tight sm:text-base ${
          active ? "text-accent" : "text-foreground"
        }`}
      >
        {trait}
      </span>
    </button>
  );
}

function TraitModal({ trait, onClose }: { trait: { trait: string; text: string }; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 px-6 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in relative w-full max-w-md rounded-2xl border border-accent/40 bg-card p-8 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 font-mono text-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
        <h3 className="font-display text-2xl uppercase text-accent sm:text-3xl">{trait.trait}</h3>
        <p className="mt-4 text-base leading-relaxed text-foreground/90 sm:text-lg">{trait.text}</p>
      </div>
    </div>
  );
}

function Player({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.intro;
  const [activeJourney, setActiveJourney] = useState(0);
  const [activeTrait, setActiveTrait] = useState<number | null>(null);

  // Rendered in two places (phone nav row / desktop row end), one of which is
  // always display:none, so only one is ever in the a11y tree.
  const nextButton = (
    <button
      type="button"
      onClick={onNext}
      className="shrink-0 rounded-full border border-accent/60 bg-accent/10 px-5 py-2.5 font-display text-sm uppercase tracking-wide text-accent transition-transform hover:scale-105 sm:px-7 sm:py-3 sm:text-base"
    >
      Next move →
    </button>
  );

  return (
    <>
      <ChapterLayout
        id="player"
        header={
          // min-h below lg keeps the photo strip clear of the fixed SoundToggle.
          <Reveal className="flex min-h-11 justify-end lg:min-h-0">
            <p className="font-mono text-sm tracking-[0.35em] text-muted-foreground">
              01 / {c.chapter}
            </p>
          </Reveal>
        }
        footer={
          // Phones stack: trait cards, then a Prev/Next nav row. From lg the
          // whole thing is one row, so the two move controls become the ends.
          <Reveal
            delay={80}
            className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-3"
          >
            <div className="hidden lg:order-1 lg:block">
              <PrevMoveButton onClick={onPrev} />
            </div>

            {/* Drops out below 2xl: with the Previous move control added, the
                footer row no longer fits this block without wrapping. */}
            <div className="hidden shrink-0 2xl:order-2 2xl:block">
              <p className="font-mono text-sm tracking-[0.15em] text-muted-foreground">
                WHAT SHAPED ME?
              </p>
              <p className="text-sm text-foreground/70">Click a trait to know more.</p>
            </div>

            {/* 2×2 on phones — four cards in a single row overflow 390px */}
            <div className="order-1 grid grid-cols-2 gap-1.5 sm:flex sm:gap-3 lg:order-3 lg:flex-1">
              {c.traits.map((t, i) => (
                <TraitCard
                  key={t.trait}
                  trait={t.trait}
                  icon={TRAIT_ICONS[i] ?? "✦"}
                  active={activeTrait === i}
                  onClick={() => setActiveTrait(i)}
                />
              ))}
            </div>

            <div className="hidden shrink-0 border-l border-border/70 pl-4 text-right lg:order-4 lg:block xl:pl-6">
              <p className="font-mono text-[0.7rem] tracking-[0.2em] text-muted-foreground">
                PRANAV WRAPPED
              </p>
              <p className="font-mono text-[0.7rem] tracking-[0.2em] text-accent">CURRENT BUILD</p>
              <p className="mt-1 font-display text-lg uppercase leading-tight text-foreground xl:text-xl">
                {c.personalityType}
              </p>
              <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground/70">
                {content.age} YEARS, STILL LOADING...
              </p>
            </div>

            <div className="order-2 flex items-center justify-between gap-3 lg:hidden">
              <PrevMoveButton onClick={onPrev} />
              {nextButton}
            </div>

            <div className="hidden lg:order-5 lg:block">{nextButton}</div>
          </Reveal>
        }
      >
        <div className="mx-auto h-full min-h-0 w-full max-w-7xl">
          <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[10rem_1fr_14rem] lg:gap-6">
            {/* left: 3 personal photos — a memory rail, independent of the journey.
                Desktop/tablet only; starts at the very top, level with Sound Off. */}
            <Reveal
              delay={120}
              className="hidden min-w-0 lg:flex lg:flex-col lg:items-stretch lg:justify-start lg:gap-3"
            >
              {c.photos.map((p, i) => (
                <PhotoSlot key={i} photo={p} ratio="aspect-[4/3]" />
              ))}
            </Reveal>

            {/* center: heading + journey, unchanged in size/position */}
            <div className="flex min-h-0 min-w-0 flex-col gap-2">
              <div className="shrink-0">
                {/* compact mobile photo strip — the memory rail becomes a small row here,
                    since the 3-column layout doesn't fit below `lg`. */}
                <div className="mb-2 flex gap-2 lg:hidden">
                  {c.photos.map((p, i) => (
                    <div key={i} className="w-11 shrink-0">
                      <PhotoSlot photo={{ label: p.label, src: p.src ?? "" }} ratio="aspect-square" />
                    </div>
                  ))}
                </div>

                <Reveal delay={40}>
                  <h1 className="font-display uppercase leading-[0.92] text-[clamp(1.5rem,4.2vw,2.75rem)] text-foreground">
                    How did I <span className="text-accent">get here?</span>
                  </h1>
                </Reveal>
                <Reveal delay={100}>
                  <p className="mt-1 max-w-2xl text-sm text-foreground/80 sm:text-base">
                    {c.subtitle}
                  </p>
                </Reveal>
              </div>

              <Reveal delay={160} className="relative min-h-0 flex-1">
                <Journey entries={c.journey} active={activeJourney} onSelect={setActiveJourney} />
              </Reveal>
            </div>

            {/* right: portrait, top-aligned below "01 / OPENING" — desktop/tablet only */}
            <Reveal delay={140} className="hidden min-w-0 lg:block">
              <PhotoSlot photo={{ label: c.portrait.label, src: c.portrait.src ?? "" }} />
              <p className="mt-2 text-center font-mono text-sm tracking-[0.25em] text-muted-foreground">
                {content.name} / 01
              </p>
            </Reveal>
          </div>
        </div>
      </ChapterLayout>

      {activeTrait !== null ? (
        <TraitModal trait={c.traits[activeTrait]!} onClose={() => setActiveTrait(null)} />
      ) : null}
    </>
  );
}

/* ─────────────────────────── 02 PASSIONS ─────────────────────────── */

type PassionItem = (typeof content.passions.items)[number];
type PassionVisual = PassionItem["visual"];

/**
 * Each passion keeps the shared dark/charcoal card, and differs only in its
 * motif + one restrained accent hue. Green stays the primary accent; the
 * others are muted so the six cards still read as one system.
 */
const PASSION_ACCENT: Record<PassionVisual, string> = {
  chess: "text-accent",
  football: "text-accent",
  sudoku: "text-sky-400",
  reading: "text-amber-400",
  building: "text-accent",
  cards: "text-rose-400",
};

/** Small line-art badge icon, drawn in the passion's accent colour. */
function PassionIcon({ visual }: { visual: PassionVisual }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-full w-full",
  };
  switch (visual) {
    case "chess":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3v3M10.5 4.5h3" />
          <path d="M12 6c-2 0-3 1.4-3 2.8 0 1.2.8 1.8 1.4 2.4L9 15h6l-1.4-3.8c.6-.6 1.4-1.2 1.4-2.4C15 7.4 14 6 12 6Z" />
          <path d="M7.5 21h9l-1-3.5h-7L7.5 21Z" />
        </svg>
      );
    case "football":
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="m12 7.2 3.2 2.3-1.2 3.8h-4l-1.2-3.8L12 7.2Z" />
          <path d="M12 3v4.2M4.2 9.6 8.8 9.5M19.8 9.6l-4.6-.1M6.6 19l2.4-5.7M17.4 19 15 13.3" />
        </svg>
      );
    case "sudoku":
      return (
        <svg {...common} aria-hidden>
          <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
          <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
        </svg>
      );
    case "reading":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 6.5C10.4 5.2 8.2 4.6 4.5 4.6v13c3.7 0 5.9.6 7.5 1.9 1.6-1.3 3.8-1.9 7.5-1.9v-13c-3.7 0-5.9.6-7.5 1.9Z" />
          <path d="M12 6.5v13" />
        </svg>
      );
    case "building":
      return (
        <svg {...common} aria-hidden>
          <path d="M14.5 4.2a4 4 0 0 0 5.3 5.3l-9.6 9.6a2.2 2.2 0 1 1-3.1-3.1l9.6-9.6" />
          <path d="M4.5 6.8 7 4.3l3.4 3.4M6.3 15.4 4 17.7l2.6 2.6" />
        </svg>
      );
    case "cards":
      return (
        <svg {...common} aria-hidden>
          <rect x="8.5" y="5.5" width="11" height="15" rx="1.8" />
          <path d="M5.6 17.6 4.6 8.2a1.8 1.8 0 0 1 1.6-2l3.4-.4" />
          <path d="M14 10c-1.1 0-1.9.8-1.9 1.8 0 1.4 1.9 2.7 1.9 2.7s1.9-1.3 1.9-2.7c0-1-.8-1.8-1.9-1.8Z" />
        </svg>
      );
  }
}

/** Faint background motif — sits behind the card text and brightens on hover. */
function PassionMotif({ visual }: { visual: PassionVisual }) {
  /**
   * The motif sits behind the card's right edge. The text column is allowed to
   * run past it, so the motif is masked to fade in from its own left edge —
   * that keeps the copy fully legible even at the brighter hover opacity.
   */
  const wrap =
    "pointer-events-none absolute inset-y-0 right-0 w-[34%] opacity-[0.13] transition-opacity duration-500 group-hover:opacity-30 [mask-image:linear-gradient(to_right,transparent,black_60%)]";
  switch (visual) {
    case "chess":
      return (
        <div className={wrap} aria-hidden>
          <svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
            {Array.from({ length: 36 }).map((_, i) => {
              const r = Math.floor(i / 6);
              const col = i % 6;
              return (r + col) % 2 === 0 ? (
                <rect key={i} x={col * 13.3} y={r * 13.3} width="13.3" height="13.3" fill="currentColor" />
              ) : null;
            })}
          </svg>
        </div>
      );
    case "football":
      return (
        <div className={wrap} aria-hidden>
          <svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="58" cy="40" r="17" />
            <path d="M80 18H50v44h30M80 30H62v20h18" />
          </svg>
        </div>
      );
    case "sudoku":
      return (
        <div className={wrap} aria-hidden>
          <svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="14" y="14" width="52" height="52" />
            <path d="M31.3 14v52M48.7 14v52M14 31.3h52M14 48.7h52" />
            <g fill="currentColor" stroke="none" fontSize="11" fontFamily="monospace">
              <text x="19" y="27">3</text>
              <text x="53" y="45">8</text>
              <text x="36" y="62">1</text>
            </g>
          </svg>
        </div>
      );
    case "reading":
      return (
        <div className={wrap} aria-hidden>
          <svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            {Array.from({ length: 9 }).map((_, i) => (
              <path key={i} d={`M18 ${20 + i * 5}h${i % 3 === 2 ? 28 : 44}`} />
            ))}
          </svg>
        </div>
      );
    case "building":
      return (
        <div className={wrap} aria-hidden>
          <svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M30 46l14-8 14 8-14 8-14-8Z" />
            <path d="M30 46v14l14 8 14-8V46M44 54v14" />
            <path d="M37 30l10-6 10 6-10 6-10-6Z" />
          </svg>
        </div>
      );
    case "cards":
      return (
        <div className={wrap} aria-hidden>
          <svg viewBox="0 0 80 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="40" y="20" width="26" height="38" rx="3" transform="rotate(-12 53 39)" />
            <rect x="46" y="24" width="26" height="38" rx="3" transform="rotate(8 59 43)" />
            <path d="M58 36c-2.2 0-3.8 1.7-3.8 3.7 0 2.9 3.8 5.6 3.8 5.6s3.8-2.7 3.8-5.6c0-2-1.6-3.7-3.8-3.7Z" fill="currentColor" stroke="none" />
          </svg>
        </div>
      );
  }
}

function PassionCard({ item, onOpen }: { item: PassionItem; onOpen: () => void }) {
  const accent = PASSION_ACCENT[item.visual];
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.title} — read more`}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-secondary/70 p-2.5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-4"
    >
      <span className={accent}>
        <PassionMotif visual={item.visual} />
      </span>

      <div className="relative flex items-center gap-2.5">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-current/40 p-1.5 transition-colors sm:h-9 sm:w-9 ${accent}`}
        >
          <PassionIcon visual={item.visual} />
        </span>
        <h3
          className={`font-display text-base uppercase leading-none tracking-tight transition-colors sm:text-lg lg:text-xl ${accent}`}
        >
          {item.title}
        </h3>
      </div>

      {/* On short phone viewports the card is a teaser — the full line always
          lives in the modal — so clamp rather than shrink the type. The flex
          sizing lives on the wrapper: -webkit-line-clamp and `flex-1` on the
          same element fight each other, and the box stretches past the clamp. */}
      <div className="relative mt-1.5 min-h-0 flex-1 sm:mt-2">
        <p className="line-clamp-3 max-w-[46ch] pr-2 text-[0.8rem] leading-snug text-foreground/75 transition-colors group-hover:text-foreground/90 sm:line-clamp-none sm:text-sm">
          {item.shortText}
        </p>
      </div>

      <div className="relative mt-1 flex items-end justify-between gap-2 sm:mt-1.5">
        {item.detail ? (
          <span className="font-mono text-[0.6rem] uppercase leading-tight tracking-[0.18em] text-muted-foreground">
            {item.detail.label}
            <span className="block text-foreground/70">{item.detail.value}</span>
          </span>
        ) : (
          <span />
        )}
        <span
          className={`font-mono text-base leading-none opacity-40 transition-all group-hover:translate-x-1 group-hover:opacity-100 ${accent}`}
          aria-hidden
        >
          →
        </span>
      </div>
    </button>
  );
}

function PassionModal({ item, onClose }: { item: PassionItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const accent = PASSION_ACCENT[item.visual];
  return (
    <div
      className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-background/85 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="animate-scale-in relative w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 font-mono text-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
        <span
          className={`mx-auto grid h-14 w-14 place-items-center rounded-full border border-current/40 p-3 ${accent}`}
        >
          <PassionIcon visual={item.visual} />
        </span>
        <h3 className={`mt-4 font-display text-2xl uppercase sm:text-3xl ${accent}`}>{item.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-foreground/90">{item.description}</p>
        {item.detail ? (
          <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            {item.detail.label} · <span className="text-foreground/80">{item.detail.value}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Passions({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.passions;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <ChapterLayout
        id="passions"
        header={
          // The chapter tag only shows from lg up, where lg:pl-24 clears the fixed
          // SoundToggle pinned top-left. Below lg there isn't room beside it, and
          // the ProgressRail's mobile chip already names the chapter.
          // min-h below lg keeps the title clear of the fixed SoundToggle.
          <div className="flex min-h-11 items-center justify-between gap-4 lg:min-h-0 lg:pl-24">
            <div className="hidden lg:block">
              <ChapterTag chapter={c.chapter} move="MOVE 02" />
            </div>
            <Reveal className="ml-auto">
              <p className="font-mono text-sm tracking-[0.35em] text-muted-foreground">
                02 / PASSIONS
              </p>
            </Reveal>
          </div>
        }
        footer={
          <Reveal delay={120} className="flex flex-wrap items-center justify-between gap-3">
            <PrevMoveButton onClick={onPrev} />

            <div className="hidden items-center gap-4 rounded-xl border border-border/70 px-4 py-2 xl:flex">
              <div className="shrink-0 border-r border-border/70 pr-4">
                <p className="font-mono text-[0.7rem] tracking-[0.2em] text-muted-foreground">
                  PRANAV WRAPPED
                </p>
                <p className="font-mono text-[0.7rem] tracking-[0.2em] text-accent">
                  {c.rotationLabel}
                </p>
              </div>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
                {c.items.map((p) => (
                  <li key={p.id} className="flex items-center gap-1.5">
                    <span
                      className={`grid h-4 w-4 place-items-center ${PASSION_ACCENT[p.visual]}`}
                      aria-hidden
                    >
                      <PassionIcon visual={p.visual} />
                    </span>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-foreground/80">
                      {p.shortLabel}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="ml-auto shrink-0 rounded-full border border-accent/60 bg-accent/10 px-6 py-2.5 font-display text-sm uppercase tracking-wide text-accent transition-transform hover:scale-105 sm:px-8 sm:py-3 sm:text-base"
            >
              Next move →
            </button>
          </Reveal>
        }
      >
        {/* lg:pr-* keeps the card grid clear of the fixed chapter rail on the right. */}
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3 lg:pr-32">
          <div className="shrink-0">
            <Reveal>
              <h2 className="max-w-4xl font-display text-[clamp(1.5rem,4vw,2.75rem)] uppercase leading-[0.92]">
                What I do when <span className="text-accent">nobody is asking</span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-1.5 max-w-3xl text-sm text-foreground/80 sm:text-base">
                {c.subtitle}
              </p>
            </Reveal>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2 sm:gap-3">
            {c.items.map((item, i) => (
              <Reveal key={item.id} delay={160 + i * 60} className="min-h-0">
                <PassionCard item={item} onOpen={() => setOpenIndex(i)} />
              </Reveal>
            ))}
          </div>
        </div>
      </ChapterLayout>

      {openIndex !== null ? (
        <PassionModal item={c.items[openIndex]!} onClose={() => setOpenIndex(null)} />
      ) : null}
    </>
  );
}

/* ─────────────────────────── 03 BEAUTY ─────────────────────────── */

/** Small line-art icon per family member — same visual language as PassionIcon. */
function FamilyIcon({ kind }: { kind: "heart" | "shield" | "hands" }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-full w-full",
  };
  switch (kind) {
    case "heart":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 20.2c-4.4-2.9-8-6.2-8-10A4.6 4.6 0 0 1 12 7.3 4.6 4.6 0 0 1 20 10.2c0 3.8-3.6 7.1-8 10Z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3.5 19 6v6c0 4.5-3 7.7-7 8.5-4-.8-7-4-7-8.5V6l7-2.5Z" />
          <path d="m9 12 2 2 4-4.2" />
        </svg>
      );
    case "hands":
      return (
        <svg {...common} aria-hidden>
          <path d="M2 13 6 9l3 1.5L12 8l3 2.5 3-1.5 4 4" />
          <path d="M9 10.5 12 13l3-2.5" />
        </svg>
      );
  }
}

type FamilyMember = (typeof content.beauty)["mother"];

function FamilyCard({
  person,
  icon,
  featured,
}: {
  person: FamilyMember;
  icon: "heart" | "shield" | "hands";
  featured?: boolean;
}) {
  return (
    <div
      className={`group relative flex h-full flex-col rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-1 sm:p-4 ${
        featured
          ? "border-accent/50 bg-secondary lg:scale-[1.04]"
          : "border-border/80 bg-secondary/70 hover:border-accent/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border p-1.5 text-accent transition-transform duration-300 group-hover:scale-110 ${
            featured ? "border-accent/60" : "border-accent/30"
          }`}
        >
          <FamilyIcon kind={icon} />
        </span>
        <span className="font-mono text-[0.65rem] tracking-[0.25em] text-muted-foreground">
          {person.relation}
        </span>
      </div>
      <h3 className="mt-1.5 font-display text-xl uppercase leading-none tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent sm:text-2xl">
        {person.trait}
      </h3>

      <PhotoSlot
        photo={person.photo}
        ratio="aspect-[4/5]"
        className="mx-auto mt-2 max-w-[6.5rem] transition-transform duration-300 group-hover:scale-[1.02] sm:max-w-[7.5rem]"
      />

      <p className="relative mt-2 flex-1 text-[0.78rem] leading-snug text-foreground/75 transition-colors duration-300 group-hover:text-foreground/90 sm:text-[0.85rem]">
        &ldquo;{person.quote}&rdquo;
      </p>
    </div>
  );
}

function Beauty({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.beauty;

  return (
    <ChapterLayout
      id="beauty"
      header={<ChapterTag chapter={c.chapter} move="MOVE 03" />}
      footer={<MoveNav onPrev={onPrev} onNext={onNext} />}
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-3">
        <div className="shrink-0 text-center">
          <Reveal>
            <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground">{c.label}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-1 font-display text-[clamp(1.75rem,5.5vw,3.5rem)] uppercase leading-[0.92]">
              BEAUTY BEGINS AT <span className="text-accent">HOME.</span>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mx-auto mt-1 max-w-2xl text-sm text-foreground/80 sm:text-base">
              {c.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3 sm:items-center sm:gap-4">
          <Reveal delay={200} className="h-full min-h-0">
            <FamilyCard person={c.mother} icon="heart" />
          </Reveal>
          <Reveal delay={280} className="h-full min-h-0">
            <FamilyCard person={c.father} icon="shield" featured />
          </Reveal>
          <Reveal delay={360} className="h-full min-h-0">
            <FamilyCard person={c.brother} icon="hands" />
          </Reveal>
        </div>

        <Reveal delay={480} className="shrink-0 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-foreground/90">
            THEY ARE MY DEFINITION OF <span className="text-accent">BEAUTY.</span>
          </p>
          <p className="mt-0.5 text-sm text-foreground/70 sm:text-base">
            Not because they are perfect, but because they are{" "}
            <span className="text-accent">real.</span>
          </p>
        </Reveal>
      </div>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 04 L'ORÉAL MATCH ─────────────────────────── */

/** A single trait card — same clickable-card language as PassionCard, but
 *  reuses the Analysis icon set / tone system and opens the shared
 *  AnalysisModal below rather than a page-specific one. */
function TraitMatchCard({
  item,
  index,
  onOpen,
}: {
  item: AnalysisItem;
  index: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.title} — trait analysis`}
      className="group flex h-full w-full flex-col items-center overflow-hidden rounded-2xl border border-accent/25 bg-card/40 p-3 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_36px_-16px_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-4"
    >
      <span className="font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="mt-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 p-2 text-accent transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
        <AnalysisIcon kind={item.icon} />
      </span>
      <h3 className="mt-2 font-display text-sm uppercase leading-tight tracking-tight text-foreground sm:text-base lg:text-lg">
        {item.title}
      </h3>
      <p className="mt-1 line-clamp-3 text-[0.72rem] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/80 sm:line-clamp-none sm:text-[0.8rem]">
        {item.text}
      </p>
      <span
        className="mt-auto pt-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent opacity-60 transition-opacity group-hover:opacity-100"
        aria-hidden
      >
        View →
      </span>
    </button>
  );
}

function Loreal({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.loreal;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex !== null ? c.traits[openIndex]! : null;

  return (
    <>
      <ChapterLayout
        id="loreal"
        header={
          // Same lg:pl-24 clearance pattern as Blunder's header — keeps the
          // "04 / 07" tag clear of the fixed SoundToggle pinned top-left.
          <div className="flex min-h-11 items-center justify-between gap-4 lg:min-h-0 lg:pl-24">
            <Reveal className="hidden lg:block">
              <p className="font-mono text-sm tracking-[0.3em] text-accent">04 / 07</p>
            </Reveal>
            <Reveal className="ml-auto">
              <p className="flex items-center gap-2 font-mono text-sm tracking-[0.3em] text-muted-foreground">
                BRAND MATCH
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
              </p>
            </Reveal>
          </div>
        }
        footer={
          <Reveal delay={220} className="flex items-center justify-between gap-3">
            <PrevMoveButton onClick={onPrev} />
            <p className="hidden flex-1 items-center justify-center gap-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground sm:flex">
              <span className="text-accent" aria-hidden>
                ♗
              </span>
              {c.moveCaption}
              <span className="text-accent" aria-hidden>
                ♗
              </span>
            </p>
            <NextMoveButton onClick={onNext} />
          </Reveal>
        }
      >
        {/* lg:pr-* keeps content clear of the fixed chapter rail, matching Blunder. */}
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 sm:gap-3 lg:pr-32">
          <div className="shrink-0 text-center">
            <Reveal>
              <p className="font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground sm:text-xs">
                IF PRANAV WERE A L&apos;ORÉAL BRAND, I&apos;D BE
              </p>
            </Reveal>
            <Reveal delay={60}>
              <p className="mt-1 font-mono text-[0.65rem] tracking-[0.3em] text-accent sm:text-xs">
                YOUR BRAND MATCH
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display text-[clamp(2.25rem,8vw,4.5rem)] uppercase leading-[0.85] text-accent">
                {c.brand}
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mx-auto mt-1 max-w-2xl font-display text-base uppercase leading-tight tracking-tight text-foreground sm:text-xl">
                {c.brandLine}
              </p>
            </Reveal>
            <Reveal delay={170}>
              <span className="mt-2 inline-block rounded-full border border-accent/40 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-accent">
                {c.stat.label} · {c.stat.value}
              </span>
            </Reveal>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {c.traits.map((item, i) => (
              <Reveal key={item.title} delay={200 + i * 60} className="min-h-0">
                <TraitMatchCard item={item} index={i} onOpen={() => setOpenIndex(i)} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={380} className="shrink-0">
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/30 px-4 py-2.5 text-center sm:px-6 sm:py-3">
              <p className="font-display text-sm italic leading-snug text-foreground sm:text-base lg:text-lg">
                &ldquo;{c.quote}&rdquo;
              </p>
              <p className="mt-1 font-mono text-[0.6rem] tracking-[0.3em] text-accent">— PRANAV</p>
            </div>
          </Reveal>
        </div>
      </ChapterLayout>

      {openItem ? (
        <AnalysisModal
          item={openItem}
          tone="accent"
          eyebrow="TRAIT ANALYSIS"
          onClose={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}

/* ─────────────────────────── 05 BRILLIANCIES & BLUNDERS ─────────────────────────── */

type AnalysisIconKind =
  | "search"
  | "target"
  | "bolt"
  | "thought"
  | "eye"
  | "king"
  | "flask"
  | "shield"
  | "puzzle";
type AnalysisTone = "accent" | "destructive";
type AnalysisItem = { title: string; text: string; note?: string; badge?: string; icon: AnalysisIconKind };

/** Small line-art icon set — same visual language as PassionIcon/FamilyIcon.
 *  "king" reuses the actual chess glyph rather than drawing a crown from
 *  scratch, tying the joke ("one more game") directly to the real piece. */
function AnalysisIcon({ kind }: { kind: AnalysisIconKind }) {
  if (kind === "king") {
    return (
      <span className="grid h-full w-full place-items-center text-[1.3em] leading-none" aria-hidden>
        ♚
      </span>
    );
  }
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-full w-full",
  };
  switch (kind) {
    case "search":
      return (
        <svg {...common} aria-hidden>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m20 20-4.8-4.8" />
        </svg>
      );
    case "target":
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2v3.2M12 18.8V22M2 12h3.2M18.8 12H22" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common} aria-hidden>
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
        </svg>
      );
    case "thought":
      return (
        <svg {...common} aria-hidden>
          <path d="M7 14.5a4.5 4.5 0 1 1 4.7-6.9A4 4 0 0 1 17 11a4 4 0 0 1-.4 8H8a4 4 0 0 1-1-8.5Z" />
          <circle cx="14.5" cy="19.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="21.6" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common} aria-hidden>
          <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      );
    case "flask":
      return (
        <svg {...common} aria-hidden>
          <path d="M9.5 3h5M10 3v6.5L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.5V3" />
          <path d="M7.2 15h9.6" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3.5 19 6v6c0 4.5-3 7.7-7 8.5-4-.8-7-4-7-8.5V6l7-2.5Z" />
          <path d="m9 12 2 2 4-4.2" />
        </svg>
      );
    case "puzzle":
      return (
        <svg {...common} aria-hidden>
          <path d="M9 4h4a1.6 1.6 0 0 1 1.6 2.7 1.6 1.6 0 0 0 1.7 2.6H20v4a1.6 1.6 0 0 1-2.7 1.6 1.6 1.6 0 0 0-2.6 1.7V20H10a1.6 1.6 0 0 1-1.6-2.7A1.6 1.6 0 0 0 6.7 15.6H4v-4a1.6 1.6 0 0 1 2.7-1.6A1.6 1.6 0 0 0 8.3 8.3 1.6 1.6 0 0 1 9 4Z" />
        </svg>
      );
  }
}

function AnalysisRow({
  index,
  item,
  tone,
  onOpen,
  ariaSuffix = "analyse this move",
}: {
  index: number;
  item: AnalysisItem;
  tone: AnalysisTone;
  onOpen: () => void;
  /** Trailing half of the row's aria-label — override when "move" doesn't fit the page's framing. */
  ariaSuffix?: string;
}) {
  const toneText = tone === "accent" ? "text-accent" : "text-destructive";
  const toneBorder = tone === "accent" ? "border-accent/40" : "border-destructive/40";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.title} — ${ariaSuffix}`}
      className="group flex w-full items-start gap-2.5 py-2.5 text-left transition-colors first:pt-0 last:pb-0 sm:gap-3 sm:py-3"
    >
      <span className={`shrink-0 font-display text-xl leading-none opacity-60 transition-opacity group-hover:opacity-100 sm:text-2xl ${toneText}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border p-1.5 transition-transform duration-300 group-hover:scale-110 sm:h-9 sm:w-9 sm:p-2 ${toneBorder} ${toneText}`}
      >
        <AnalysisIcon kind={item.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm uppercase leading-tight tracking-tight text-foreground transition-colors sm:text-base lg:text-lg">
          {item.title}
        </span>
        <span className="mt-0.5 block text-[0.72rem] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/80 sm:text-[0.8rem]">
          {item.text}
        </span>
      </span>
      <span
        className={`mt-1 shrink-0 font-mono text-sm opacity-40 transition-all group-hover:translate-x-1 group-hover:opacity-100 sm:text-base ${toneText}`}
        aria-hidden
      >
        →
      </span>
    </button>
  );
}

function AnalysisPanel({
  title,
  glyph,
  tone,
  items,
  onOpen,
  ariaSuffix = "analyse this move",
}: {
  title: string;
  glyph: string;
  tone: AnalysisTone;
  items: AnalysisItem[];
  onOpen: (i: number) => void;
  ariaSuffix?: string;
}) {
  const toneText = tone === "accent" ? "text-accent" : "text-destructive";
  const toneBorder = tone === "accent" ? "border-accent/40" : "border-destructive/35";
  const toneGlow =
    tone === "accent"
      ? "shadow-[0_0_36px_-16px_var(--accent)]"
      : "shadow-[0_0_36px_-16px_var(--destructive)]";
  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-2xl border bg-card/40 p-3 transition-shadow duration-300 hover:shadow-[0_0_44px_-14px_currentColor] sm:p-4 ${toneBorder} ${toneGlow} ${toneText}`}
    >
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-lg sm:text-xl" aria-hidden>
          {glyph}
        </span>
        <h3 className={`font-display text-lg uppercase tracking-tight sm:text-xl ${toneText}`}>{title}</h3>
      </div>
      <div className="mt-1 min-h-0 flex-1 divide-y divide-border/50 overflow-hidden text-foreground sm:mt-2">
        {items.map((item, i) => (
          <AnalysisRow
            key={item.title}
            index={i}
            item={item}
            tone={tone}
            onOpen={() => onOpen(i)}
            ariaSuffix={ariaSuffix}
          />
        ))}
      </div>
    </div>
  );
}

function AnalysisModal({
  item,
  tone,
  onClose,
  eyebrow,
}: {
  item: AnalysisItem;
  tone: AnalysisTone;
  onClose: () => void;
  /** Overrides the default MOVE/POSITION ANALYSIS eyebrow for pages that
   *  aren't framing the item as a chess move (e.g. a personality trait). */
  eyebrow?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toneText = tone === "accent" ? "text-accent" : "text-destructive";
  const toneBorder = tone === "accent" ? "border-accent/40" : "border-destructive/40";

  return (
    <div
      className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-background/85 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className={`animate-scale-in relative w-full max-w-md rounded-2xl border bg-card p-8 text-center ${toneBorder}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 font-mono text-lg text-muted-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
        <p className={`font-mono text-[0.65rem] uppercase tracking-[0.3em] ${toneText}`}>
          {eyebrow ?? (tone === "accent" ? "MOVE ANALYSIS" : "POSITION ANALYSIS")}
        </p>
        <span
          className={`mx-auto mt-3 grid h-14 w-14 place-items-center rounded-full border p-3 ${toneBorder} ${toneText}`}
        >
          <AnalysisIcon kind={item.icon} />
        </span>
        <h3 className={`mt-4 font-display text-2xl uppercase sm:text-3xl ${toneText}`}>{item.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-foreground/90">{item.text}</p>
        {item.note ? (
          <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">{item.note}</p>
        ) : null}
        {item.badge ? (
          <span
            className={`mt-4 inline-block rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] ${toneBorder} ${toneText}`}
          >
            {item.badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Blunder({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.blunder;
  const [openItem, setOpenItem] = useState<{ tone: AnalysisTone; index: number } | null>(null);
  const openData = openItem
    ? openItem.tone === "accent"
      ? c.brilliancies[openItem.index]
      : c.blunders[openItem.index]
    : null;

  return (
    <>
      <ChapterLayout
        id="blunder"
        header={
          // "05 / 07" only shows from lg, where lg:pl-24 clears the fixed
          // SoundToggle pinned top-left — same treatment as Passions/Player.
          // Below lg the ProgressRail's mobile chip already names the chapter.
          <div className="flex min-h-11 items-center justify-between gap-4 lg:min-h-0 lg:pl-24">
            <Reveal className="hidden lg:block">
              <p className="font-mono text-sm tracking-[0.3em] text-accent">05 / 07</p>
            </Reveal>
            <Reveal className="ml-auto">
              <p className="flex items-center gap-2 font-mono text-sm tracking-[0.3em] text-muted-foreground">
                ANALYSIS MODE
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
              </p>
            </Reveal>
          </div>
        }
        footer={
          <Reveal delay={220} className="flex items-center justify-between gap-3">
            <PrevMoveButton onClick={onPrev} />
            <p className="hidden flex-1 items-center justify-center gap-3 text-center font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground sm:flex">
              <span className="text-accent" aria-hidden>
                ⊙
              </span>
              Click a move to <span className="text-accent">analyse</span> it
              <span className="text-accent" aria-hidden>
                ⊙
              </span>
            </p>
            <NextMoveButton onClick={onNext} />
          </Reveal>
        }
      >
        {/* lg:pr-* keeps the panels clear of the fixed chapter rail on the right. */}
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 sm:gap-3 lg:pr-32">
          <div className="shrink-0 text-center">
            <Reveal>
              <h2 className="font-display text-[clamp(1.5rem,5vw,3.25rem)] uppercase leading-[0.92]">
                <span className="text-accent">BRILLIANCIES</span> &amp;{" "}
                <span className="text-accent">BLUNDERS</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="mx-auto mt-1 text-sm text-foreground/80 sm:text-base">
                THE MOVES I GET RIGHT.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto text-sm text-foreground/80 sm:text-base">
                THE ONES I&apos;M STILL <span className="text-accent">LEARNING.</span>
              </p>
            </Reveal>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <Reveal delay={160} className="min-h-0">
              <AnalysisPanel
                title="BRILLIANCIES"
                glyph="♞"
                tone="accent"
                items={c.brilliancies}
                onOpen={(i) => setOpenItem({ tone: "accent", index: i })}
              />
            </Reveal>
            <Reveal delay={220} className="min-h-0">
              <AnalysisPanel
                title="BLUNDERS"
                glyph="♟"
                tone="destructive"
                items={c.blunders}
                onOpen={(i) => setOpenItem({ tone: "destructive", index: i })}
              />
            </Reveal>
          </div>
        </div>
      </ChapterLayout>

      {openData ? (
        <AnalysisModal item={openData} tone={openItem!.tone} onClose={() => setOpenItem(null)} />
      ) : null}
    </>
  );
}

/* ─────────────────────────── 06 WRAPPED ─────────────────────────── */

/** Static bar heights read as "a waveform" without pulling in a real
 *  audio-visualizer dependency for one glance-and-move-on card. */
function Waveform() {
  const heights = [40, 70, 100, 55, 85, 45, 65, 30];
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-accent/70 transition-colors duration-300 group-hover:bg-accent"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function WrappedCard({ index, card }: { index: number; card: WrappedCardData }) {
  const isMistake = card.kind === "mistake";
  const toneText = isMistake ? "text-destructive" : "text-accent";
  const toneBorder = isMistake
    ? "border-destructive/35 hover:border-destructive/70"
    : "border-accent/25 hover:border-accent/60";
  const toneGlow = isMistake
    ? "hover:shadow-[0_0_36px_-18px_var(--destructive)]"
    : "hover:shadow-[0_0_36px_-18px_var(--accent)]";

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-card/40 p-4 transition-all duration-300 hover:-translate-y-1 sm:p-5 ${toneBorder} ${toneGlow}`}
    >
      <p className={`font-mono text-[0.62rem] tracking-[0.25em] ${toneText}`}>
        {String(index + 1).padStart(2, "0")} / {card.label}
      </p>

      <div className="mt-3 flex-1">
        {card.kind === "music" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <Waveform />
              <span
                className="text-lg text-accent/70 transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              >
                ▶
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl uppercase leading-[0.9] sm:text-3xl">
              {card.song}
            </h3>
            <p className="mt-0.5 font-mono text-xs tracking-[0.2em] text-muted-foreground">
              {card.artist}
            </p>
          </>
        ) : card.kind === "match" ? (
          <>
            <div className="flex items-center justify-between gap-2 font-mono text-[0.62rem] tracking-[0.1em] text-muted-foreground">
              <span>{card.teamA}</span>
              <span className="text-accent">VS</span>
              <span className="text-right">{card.teamB}</span>
            </div>
            <p className="mt-2 text-center font-display text-4xl leading-none text-accent sm:text-5xl">
              {card.score}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden>♞</span>
              {card.round} · MATCH ANALYSIS
            </div>
          </>
        ) : card.kind === "thought" ? (
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl uppercase leading-[0.95] sm:text-3xl">
              {card.text}
            </h3>
            <div
              className="grid shrink-0 grid-cols-3 gap-x-1.5 gap-y-0.5 pt-1 font-mono text-[0.62rem] text-muted-foreground/70"
              aria-hidden
            >
              <span>1</span>
              <span>3</span>
              <span>5</span>
              <span>2</span>
              <span>4</span>
              <span>R</span>
            </div>
          </div>
        ) : card.kind === "mistake" ? (
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl uppercase leading-[0.95] text-destructive sm:text-2xl">
              {card.text}
            </h3>
            <span className="mt-0.5 shrink-0 text-lg text-destructive" aria-hidden>
              ⚠
            </span>
          </div>
        ) : card.kind === "twist" ? (
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{card.from}</p>
            <p className="my-1 text-accent" aria-hidden>
              ↓
            </p>
            <h3 className="font-display text-2xl uppercase leading-[0.95] text-accent sm:text-3xl">
              {card.to}
            </h3>
          </div>
        ) : (
          <PhotoSlot photo={card.photo} ratio="aspect-[16/10]" className="mb-2" />
        )}
      </div>

      {card.kind === "experience" ? (
        <h3 className="mt-1 font-display text-lg uppercase leading-tight sm:text-xl">
          {card.title}
        </h3>
      ) : null}
      <p className="mt-2 text-[0.78rem] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/80">
        {card.caption}
      </p>
    </div>
  );
}

function FinalWrappedCard({ final }: { final: typeof content.wrapped.final }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-card/60 p-6 text-center shadow-[0_0_50px_-22px_var(--accent)] sm:p-8">
      <div className="grain pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <p className="relative font-mono text-xs tracking-[0.3em] text-accent">{final.label}</p>
      <span className="relative mt-3 inline-block text-3xl text-accent sm:text-4xl" aria-hidden>
        ♚
      </span>
      <h3 className="relative mt-3 font-display text-2xl uppercase leading-[0.95] sm:text-4xl">
        {final.lines[0]}
      </h3>
      <h3 className="relative mt-1 font-display text-2xl uppercase leading-[0.95] text-accent sm:text-4xl">
        {final.lines[1]}
      </h3>
      <span className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        {final.tag} <span aria-hidden>♥</span>
      </span>
    </div>
  );
}

function Wrapped({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.wrapped;

  return (
    <ChapterLayout
      id="wrapped"
      scrollContent
      header={
        // Same lg:pl-24 clearance pattern used on Blunder/Loreal's headers.
        <div className="flex min-h-11 items-center justify-between gap-4 lg:min-h-0 lg:pl-24">
          <Reveal className="hidden lg:block">
            <p className="font-mono text-sm tracking-[0.3em] text-accent">06 / 07</p>
          </Reveal>
          <Reveal className="ml-auto">
            <p className="flex items-center gap-2 font-mono text-sm tracking-[0.3em] text-muted-foreground">
              FINAL WRAPPED
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            </p>
          </Reveal>
        </div>
      }
      footer={
        <Reveal delay={120} className="flex items-center justify-between gap-3">
          <PrevMoveButton onClick={onPrev} />
          <p className="hidden flex-1 text-center font-mono text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground sm:block">
            ↓ scroll for the full recap
          </p>
          <NextMoveButton onClick={onNext} />
        </Reveal>
      }
    >
      {/* This is the one chapter that scrolls — everything below lives inside
          ChapterLayout's scrollContent pane, not the fixed centered column
          every other chapter uses. lg:pr-32 still clears the right rail. */}
      <div className="mx-auto w-full max-w-6xl pb-2 lg:pr-32">
        <div className="pt-2 text-center sm:pt-4">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{c.eyebrow}</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-1 font-display text-[clamp(2.5rem,9vw,5rem)] uppercase leading-[0.85]">
              <span className="text-accent">{content.name}</span> WRAPPED
            </h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="mx-auto mt-2 max-w-xl font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">
              {c.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {c.cards.map((card, i) => (
            <ScrollReveal key={card.label} delay={(i % 3) * 60}>
              <WrappedCard index={i} card={card} />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-4">
          <FinalWrappedCard final={c.final} />
        </ScrollReveal>

        <ScrollReveal delay={80} className="mt-6 pb-6 text-center">
          <p className="font-display text-xl uppercase tracking-tight sm:text-2xl">
            {c.outro.thanks}
          </p>
          <p className="mt-1 font-mono text-xs tracking-[0.25em] text-accent sm:text-sm">
            {c.outro.line}
          </p>
        </ScrollReveal>
      </div>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 07 THE NEXT MOVE ─────────────────────────── */

function Endgame({
  pieces,
  onPrev,
  onReplay,
}: {
  pieces: Piece[];
  onPrev: () => void;
  onReplay: () => void;
}) {
  const c = content.endgame;
  return (
    <ChapterLayout
      id="endgame"
      header={<ChapterTag chapter={c.chapter} move="MOVE 07" />}
      footer={
        <Reveal delay={100} className="flex items-center justify-between gap-3">
          <PrevMoveButton onClick={onPrev} />

          <div className="flex flex-1 flex-col items-center gap-1">
            <button
              type="button"
              onClick={onReplay}
              className="rounded-full border border-border px-6 py-2 font-mono text-sm tracking-[0.25em] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              ↻ PLAY AGAIN
            </button>
            <p className="hidden font-mono text-sm tracking-[0.2em] text-muted-foreground/60 sm:block">
              {content.subtitle}
            </p>
          </div>
        </Reveal>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal className="mx-auto lg:mx-0">
          <Chessboard pieces={pieces} size={BOARD_SIZE_SM} />
          <p className="mt-2 text-center font-mono text-sm tracking-[0.2em] text-muted-foreground lg:text-left">
            SAME BOARD. DIFFERENT POSITION.
          </p>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="font-display text-[clamp(1.75rem,6vw,3.5rem)] uppercase leading-[0.86]">
              {c.title}
            </h2>
          </Reveal>
          <div className="mt-2 space-y-0.5">
            {c.lines.map((l, i) => (
              <Reveal key={l} delay={i * 60}>
                <p className="font-display text-base uppercase text-muted-foreground sm:text-lg">
                  {l}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={140} className="hidden sm:block">
            <div className="mt-3 rounded-xl border border-border bg-card p-3">
              <div className="font-mono text-sm tracking-[0.2em] text-accent">GAME STATUS</div>
              <dl className="mt-2 divide-y divide-border">
                {c.status.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 py-1.5">
                    <dt className="font-mono text-sm tracking-[0.15em] text-muted-foreground">
                      {s.label.toUpperCase()}
                    </dt>
                    <dd className="font-display text-base uppercase">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-4 text-center">
        {c.final.map((l, i) => (
          <Reveal key={l} delay={i * 100}>
            <p className="mx-auto max-w-2xl font-display text-lg uppercase leading-tight sm:text-2xl">
              {l}
            </p>
          </Reveal>
        ))}
        <Reveal delay={200}>
          <p className="mt-3 font-mono text-sm tracking-[0.3em] text-accent">{c.signoff}</p>
        </Reveal>
      </div>
    </ChapterLayout>
  );
}
