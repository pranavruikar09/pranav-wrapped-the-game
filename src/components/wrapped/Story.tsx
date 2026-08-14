import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { content } from "@/content/cv";
import { Chessboard } from "./Chessboard";
import { MOVES, applyMove, positionAfter, type Piece } from "./chess";
import { ChapterLayout } from "./ChapterLayout";
import { Counter } from "./Counter";
import { PhotoSlot } from "./PhotoSlot";
import { ChapterTag, Reveal } from "./Reveal";
import { Loader, ProgressRail, SoundToggle } from "./Chrome";
import { playTick, setSoundEnabled } from "./sound";

type ChapterId =
  | "player"
  | "passions"
  | "attack"
  | "beauty"
  | "loreal"
  | "blunder"
  | "wrapped"
  | "endgame";

/** Chapter order. Index i is entered by playing MOVES[i]. */
const CHAPTER_ORDER: ChapterId[] = [
  "player",
  "passions",
  "attack",
  "beauty",
  "loreal",
  "blunder",
  "wrapped",
  "endgame",
];

const CHAPTER_LABELS = [
  "01 PLAYER",
  "02 PASSIONS",
  "03 COMPETITION",
  "04 BEAUTY",
  "05 MATCH",
  "06 BLUNDER",
  "07 WRAPPED",
  "08 ENDGAME",
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
    case "attack":
      return <Attack onNext={onNext} onPrev={onPrev} />;
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

/* ─────────────────────────── 03 ATTACK ─────────────────────────── */

function Attack({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.competitive;
  const [val, setVal] = useState(c.scale);
  return (
    <ChapterLayout
      id="attack"
      header={<ChapterTag chapter={c.chapter} move="MOVE 03" />}
      footer={<MoveNav onPrev={onPrev} onNext={onNext} />}
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div>
          <Reveal>
            <h2 className="font-display text-[clamp(2rem,6vw,3.75rem)] uppercase leading-[0.88]">
              {c.title}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">{c.subtitle}</p>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-3 max-w-lg text-base leading-relaxed sm:text-lg">{c.text}</p>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="font-mono text-sm tracking-[0.2em] text-accent">WHY I COMPETE</div>
              <div className="mt-4 flex items-center justify-between font-display text-sm uppercase">
                <span>{c.scaleLeft}</span>
                <span>{c.scaleRight}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={(e) => setVal(Number(e.target.value))}
                aria-label="Why I compete: winning versus getting better"
                className="mt-3 w-full accent-accent"
              />
              <p className="mt-3 text-center font-mono text-sm tracking-[0.15em] text-muted-foreground">
                {val}% GETTING BETTER · {100 - val}% WINNING
              </p>
            </div>
          </Reveal>

          <div className="mt-3 space-y-2">
            {c.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="flex flex-col gap-0.5 rounded-xl border border-border p-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-mono text-sm tracking-[0.2em] text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="font-display text-base uppercase sm:text-right">{s.value}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 04 BEAUTY ─────────────────────────── */

function Beauty({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.beauty;
  const [activeConcept, setActiveConcept] = useState(0);
  const def = c.definitions[activeConcept]!;
  return (
    <ChapterLayout
      id="beauty"
      className="bg-cream text-cream-foreground"
      header={
        <Reveal className="flex items-center gap-3">
          <span className="h-px w-8 bg-cream-foreground/40" />
          <span className="font-mono text-sm tracking-[0.3em]">{c.chapter}</span>
          <span className="font-mono text-sm tracking-[0.3em] opacity-50">MOVE 04</span>
        </Reveal>
      }
      footer={<MoveNav onPrev={onPrev} onNext={onNext} tone="cream" />}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="float-slow absolute -right-24 top-16 h-72 w-72 rounded-full border border-cream-foreground/15" />
        <div className="float-slow absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-cream-foreground/[0.04]" />
      </div>
      <div className="relative">
        <Reveal>
          <h2 className="max-w-4xl font-display text-[clamp(1.75rem,5.5vw,3.25rem)] uppercase leading-[0.9]">
            {c.title}
          </h2>
        </Reveal>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="max-w-md space-y-2">
            <Reveal>
              <div className="border-l-2 border-cream-foreground/30 pl-4">
                <div className="font-mono text-sm tracking-[0.2em] opacity-60">
                  I USED TO THINK…
                </div>
                <p className="mt-1 text-base leading-snug sm:text-lg">{c.used_to_think}</p>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <p className="pl-4 font-mono text-sm tracking-[0.2em] opacity-50">BUT THEN.</p>
            </Reveal>
            <Reveal delay={220}>
              <div className="border-l-2 border-cream-foreground pl-4">
                <div className="font-mono text-sm tracking-[0.2em]">NOW I THINK…</div>
                <p className="mt-1 text-base leading-snug sm:text-lg">{c.now_think}</p>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal delay={160} className="flex flex-wrap gap-2">
              {c.definitions.map((d, i) => (
                <button
                  key={d.concept}
                  type="button"
                  onClick={() => setActiveConcept(i)}
                  aria-pressed={i === activeConcept}
                  className={`rounded-full border px-4 py-1.5 font-display text-sm uppercase tracking-wide transition-colors ${
                    i === activeConcept
                      ? "border-cream-foreground bg-cream-foreground text-cream"
                      : "border-cream-foreground/30 hover:border-cream-foreground"
                  }`}
                >
                  {d.concept}
                </button>
              ))}
            </Reveal>

            <Reveal
              key={activeConcept}
              className="mt-3 max-w-md border-t border-cream-foreground/20 pt-3"
            >
              <h3 className="font-display text-xl uppercase leading-none">
                <span className="opacity-40">BEAUTY =</span> {def.concept}
              </h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">{def.text}</p>
            </Reveal>

            <Reveal delay={100} className="mt-3 max-w-[9rem]">
              <PhotoSlot photo={c.memory} ratio="aspect-[3/2]" />
            </Reveal>
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 05 L'ORÉAL MATCH ─────────────────────────── */

function Loreal({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.loreal;
  const [active, setActive] = useState(0);
  const reason = c.reasons[active]!;
  return (
    <ChapterLayout
      id="loreal"
      header={
        <Reveal>
          <span className="font-mono text-sm tracking-[0.3em] text-accent">
            BRAND MATCH · MOVE 05
          </span>
        </Reveal>
      }
      footer={<MoveNav onPrev={onPrev} onNext={onNext} />}
    >
      <Reveal>
        <h2 className="max-w-3xl font-display text-[clamp(1.75rem,5vw,3rem)] uppercase leading-[0.9]">
          {c.title}
        </h2>
      </Reveal>
      <Reveal delay={140}>
        <div className="mt-3 overflow-hidden rounded-2xl border border-accent/40 bg-card p-4 text-center sm:p-5">
          <div className="font-mono text-sm tracking-[0.25em] text-muted-foreground">
            THE MATCH IS
          </div>
          <p className="mt-1 font-display text-[clamp(1.75rem,6vw,3.5rem)] uppercase leading-[0.9] text-accent">
            {c.brand}
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
            {c.brandLine}
          </p>
        </div>
      </Reveal>

      <Reveal delay={180} className="mt-3 flex flex-wrap justify-center gap-2">
        {c.reasons.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`rounded-full border px-4 py-1.5 font-mono text-sm tracking-[0.2em] transition-colors ${
              i === active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </Reveal>

      <Reveal
        key={active}
        className="mx-auto mt-3 max-w-xl rounded-2xl border border-border bg-card p-3 text-center sm:p-4"
      >
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{reason.text}</p>
      </Reveal>

      <Reveal delay={120}>
        <div className="mx-auto mt-3 max-w-xl rounded-2xl border border-dashed border-border p-3 text-center sm:p-4">
          <div className="font-display text-lg uppercase sm:text-xl">
            BUT WE&apos;RE NOT IDENTICAL.
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.notIdentical}</p>
        </div>
      </Reveal>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 06 THE BLUNDER ─────────────────────────── */

function Blunder({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.blunder;
  const [active, setActive] = useState(0);
  const row = c.rows[active]!;
  return (
    <ChapterLayout
      id="blunder"
      header={<ChapterTag chapter={c.chapter} move="MOVE 06" />}
      footer={<MoveNav onPrev={onPrev} onNext={onNext} />}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <Reveal>
            <h2 className="max-w-3xl font-display text-[clamp(1.75rem,5.5vw,3.25rem)] uppercase leading-[0.9]">
              {c.title}
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-3 font-mono text-sm tracking-[0.25em] text-destructive">
              {c.headline}
            </div>
            <p className="mt-1 font-display text-xl uppercase leading-tight sm:text-2xl">
              {c.name}
            </p>
          </Reveal>

          <Reveal delay={160} className="mt-3 flex flex-wrap gap-2">
            {c.rows.map((r, i) => (
              <button
                key={r.label}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                className={`rounded-full border px-3 py-1.5 font-mono text-sm tracking-[0.15em] transition-colors ${
                  i === active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </Reveal>

          <Reveal key={active} className="mt-2 max-w-xl rounded-xl border border-border bg-card p-3">
            <p className="text-sm leading-relaxed text-muted-foreground">{row.text}</p>
          </Reveal>
        </div>

        <Reveal delay={160} className="hidden sm:block">
          <div className="mx-auto grid w-24 place-items-center">
            <span className="shake-piece text-5xl text-destructive">♞</span>
            <p className="mt-2 text-center font-mono text-sm tracking-[0.2em] text-muted-foreground">
              PIECE HANGING
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={100}>
        <div className="mt-3 rounded-xl border border-border bg-secondary p-3">
          <div className="font-mono text-sm tracking-[0.2em] text-muted-foreground">
            SECONDARY BLUNDER
          </div>
          <h3 className="mt-1 font-display text-lg uppercase sm:text-xl">{c.second.name}</h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed">{c.second.text}</p>
          <p className="mt-1 hidden max-w-2xl text-sm leading-relaxed text-muted-foreground sm:block">
            {c.second.reflection}
          </p>
        </div>
      </Reveal>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 07 WRAPPED ─────────────────────────── */

type WrappedSlide =
  | { kind: "card"; card: (typeof content.wrapped.cards)[number] }
  | { kind: "numbers" }
  | { kind: "mood" };

function Wrapped({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const c = content.wrapped;
  const marquee = useMemo(
    () => Array(2).fill(`${content.name} WRAPPED · ${content.year} · `).join("").repeat(4),
    [],
  );
  const slides = useMemo<WrappedSlide[]>(
    () => [
      ...c.cards.map((card) => ({ kind: "card" as const, card })),
      { kind: "numbers" as const },
      { kind: "mood" as const },
    ],
    [c.cards],
  );
  const [i, setI] = useState(0);
  const slide = slides[i]!;
  const isLast = i === slides.length - 1;

  return (
    <ChapterLayout
      id="wrapped"
      className="overflow-hidden"
      header={
        <Reveal className="flex items-center gap-3">
          <span className="h-px w-8 bg-accent" />
          <span className="font-mono text-sm tracking-[0.3em] text-accent">MOVE 07</span>
        </Reveal>
      }
      footer={
        <div className="flex items-center gap-3">
          {/* chapter-level back, kept visually distinct from the slide stepper */}
          <PrevMoveButton onClick={onPrev} />

          <div className="flex flex-1 items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            aria-label="Previous stat"
            className="font-mono text-sm tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            ← PREV
          </button>
          <div className="flex gap-2" aria-hidden>
            {slides.map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  dotIdx === i ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
            <button
              type="button"
              onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))}
              disabled={isLast}
              aria-label="Next stat"
              className="font-mono text-sm tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              NEXT →
            </button>
          </div>

          {/* the chapter CTA only unlocks once every stat has been seen */}
          {isLast ? (
            <NextMoveButton onClick={onNext} />
          ) : (
            <span
              aria-hidden
              className="shrink-0 rounded-full border border-transparent px-5 py-2.5 font-display text-sm uppercase tracking-wide text-transparent sm:px-7 sm:py-3"
            >
              Next move →
            </span>
          )}
        </div>
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-6 select-none opacity-[0.06]" aria-hidden>
        <div className="marquee whitespace-nowrap font-display text-6xl uppercase">{marquee}</div>
      </div>

      <div className="relative">
        <Reveal>
          <h2 className="font-display text-[clamp(1.75rem,5.5vw,3.25rem)] uppercase leading-[0.88] text-accent">
            {c.title}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-1 font-mono text-sm tracking-[0.2em] text-muted-foreground">
            {c.subtitle}
          </p>
        </Reveal>

        <Reveal key={i} className="mt-4 grid place-items-center">
          {slide.kind === "card" ? (
            <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 text-center sm:p-6">
              <div className="font-mono text-sm tracking-[0.2em] text-accent">
                {slide.card.label}
              </div>
              <p className="mt-3 font-display text-2xl uppercase leading-[0.95] sm:text-3xl">
                {slide.card.value}
              </p>
            </div>
          ) : slide.kind === "numbers" ? (
            <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3">
              {c.numbers.map((n) => (
                <div key={n.label} className="text-center">
                  <div className="font-display text-3xl leading-none text-accent sm:text-4xl">
                    <Counter to={n.value} suffix={n.suffix} />
                  </div>
                  <div className="mt-2 font-mono text-sm tracking-[0.2em] text-muted-foreground">
                    {n.label}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <div className="font-mono text-sm tracking-[0.25em] text-muted-foreground">
                CURRENT MOOD
              </div>
              <p className="mt-2 font-display text-[clamp(1.75rem,5.5vw,3.25rem)] uppercase leading-[0.9]">
                &ldquo;{c.mood}&rdquo;
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </ChapterLayout>
  );
}

/* ─────────────────────────── 08 THE NEXT MOVE ─────────────────────────── */

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
      header={<ChapterTag chapter={c.chapter} move="MOVE 08" />}
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
