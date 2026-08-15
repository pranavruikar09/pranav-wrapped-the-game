import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { content, type Photo, type WrappedCard as WrappedCardData } from "@/content/cv";
import { Chessboard } from "./Chessboard";
import { FINAL_MOVE, MOVES, applyMove, positionAfter, type Piece } from "./chess";
import { ChapterLayout } from "./ChapterLayout";
import { PhotoSlot } from "./PhotoSlot";
import { ChapterTag, Reveal } from "./Reveal";
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
/** The Endgame board — a major visual anchor, larger than BOARD_SIZE_LG, but
 *  still bounded on both axes so the bottom closing section always fits. */
const BOARD_SIZE_ENDGAME = "min(46dvh, 30vw, 24rem)";
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
        {played && isFinalMove ? (
          <p className="mt-1 animate-fade-in font-display text-lg uppercase tracking-[0.2em] text-accent sm:text-xl">
            Checkmate.
          </p>
        ) : null}
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

/** Shared call-to-action used in the footer of every non-final chapter —
 *  and, with an overridden label, as the Endgame page's single primary
 *  "Play again" action, so there's exactly one pill-button style site-wide. */
function NextMoveButton({
  onClick,
  tone = "dark",
  label = "Next move →",
}: {
  onClick: () => void;
  tone?: MoveNavTone;
  label?: string;
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
      {label}
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
  { x: 4, y: 7 }, // 0 Salwadgaon — start
  { x: 20, y: 18 }, // 1 Ahmednagar
  { x: 5, y: 38 }, // 2 Shevgaon
  { x: 20, y: 54 }, // 3 School — House Captain (sub)
  { x: 36, y: 58 }, // 4 School — Head Boy (sub)
  { x: 39, y: 10 }, // 5 Pune — JEE prep
  { x: 57, y: 12 }, // 6 JEE — blunder
  { x: 56, y: 42 }, // 7 Karad
  { x: 56, y: 64 }, // 8 Karad — Robotics (sub)
  { x: 59, y: 85 }, // 9 Karad — Indoor Games (sub)
  { x: 73, y: 25 }, // 10 Pune — first job
  { x: 91, y: 9 }, // 11 CAT — blunder
  { x: 90, y: 54 }, // 12 Mumbai — current
];
/** The lower-left of the timeline box is deliberately left empty by the layout
 *  above — JourneyLegend is overlaid there (see Player). */
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
/** Which edges (as "a-b" keys) should highlight for the currently-hovered
 *  node — nothing highlights when nothing is hovered. */
function activeEdgeKeys(hovered: number | null): Set<string> {
  const keys = new Set<string>();
  if (hovered === null) return keys;
  const mainPos = JOURNEY_MAIN_PATH.indexOf(hovered);
  if (mainPos !== -1) {
    if (mainPos > 0) keys.add(`${JOURNEY_MAIN_PATH[mainPos - 1]}-${hovered}`);
    if (mainPos < JOURNEY_MAIN_PATH.length - 1) keys.add(`${hovered}-${JOURNEY_MAIN_PATH[mainPos + 1]}`);
  }
  for (const [a, b] of JOURNEY_BRANCHES) {
    if (a === hovered || b === hovered) keys.add(`${a}-${b}`);
  }
  return keys;
}

type JourneyIconKind = JourneyEntry["icon"];

/** Small line-art icon per journey milestone — same technical pattern as
 *  AnalysisIcon/PassionIcon/FamilyIcon (24x24, thin stroke, currentColor). */
function JourneyIcon({ kind }: { kind: JourneyIconKind }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-full w-full",
  };
  switch (kind) {
    case "home":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 10v9h5v-5h2v5h5v-9" />
        </svg>
      );
    case "hostel":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 19v-6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2h8a2 2 0 0 1 2 2v4" />
          <path d="M3 19h18M3 19v1.5M21 21v-2" />
          <circle cx="6.5" cy="9.5" r="1.3" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3.5 19 6v6c0 4.5-3 7.7-7 8.5-4-.8-7-4-7-8.5V6l7-2.5Z" />
          <path d="m9 12 2 2 4-4.2" />
        </svg>
      );
    case "crown":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 9l3.2 2.6L12 5l4.8 6.6L20 9l-1.6 9H5.6L4 9Z" />
          <path d="M6 20.5h12" />
        </svg>
      );
    case "book":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 6.5C10.4 5.2 8.2 4.6 4.5 4.6v13c3.7 0 5.9.6 7.5 1.9 1.6-1.3 3.8-1.9 7.5-1.9v-13c-3.7 0-5.9.6-7.5 1.9Z" />
          <path d="M12 6.5v13" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} aria-hidden>
          <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
        </svg>
      );
    case "circuit":
      return (
        <svg {...common} aria-hidden>
          <circle cx="6" cy="7" r="1.8" />
          <circle cx="18" cy="17" r="1.8" />
          <path d="M6 8.8V13a2 2 0 0 0 2 2h8.2" />
        </svg>
      );
    case "robot":
      return (
        <svg {...common} aria-hidden>
          <rect x="5.5" y="9" width="13" height="9.5" rx="2" />
          <path d="M12 5.5v3.5" />
          <circle cx="12" cy="4.5" r="1" fill="currentColor" stroke="none" />
          <path d="M9 13.2h.01M15 13.2h.01M9.5 16.3h5" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common} aria-hidden>
          <path d="M8 4h8v4.2a4 4 0 0 1-8 0V4Z" />
          <path d="M8 5.2H5.3a2.8 2.8 0 0 0 2.8 4.6M16 5.2h2.7a2.8 2.8 0 0 1-2.8 4.6" />
          <path d="M10.3 13.8V17h3.4v-3.2M8.3 20h7.4" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common} aria-hidden>
          <rect x="3.2" y="8" width="17.6" height="11" rx="2" />
          <path d="M8.3 8V6.3a2 2 0 0 1 2-2h3.4a2 2 0 0 1 2 2V8M3.2 13h17.6" />
        </svg>
      );
    case "graduation":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 4.5 2.5 9l9.5 4.5L21.5 9 12 4.5Z" />
          <path d="M6.5 11.3v3.9c0 1.4 2.6 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-3.9" />
        </svg>
      );
  }
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
  hovered,
  onEnter,
  onLeave,
  onToggle,
}: {
  entries: JourneyEntry[];
  /** Node index the info card is currently shown for, or null when nothing
   *  is hovered/tapped — the default, clean resting state. */
  hovered: number | null;
  onEnter: (i: number) => void;
  onLeave: (i: number) => void;
  /** Click/tap — the secondary interaction for touch devices, where hover
   *  doesn't exist. Toggles the card open/closed on the tapped node. */
  onToggle: (i: number) => void;
}) {
  const highlighted = useMemo(() => activeEdgeKeys(hovered), [hovered]);

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
        const isHovered = i === hovered;
        const isBlunder = entry.kind === "blunder";
        const isCurrent = entry.kind === "current";
        const isSub = entry.kind === "sub";

        const markerSize = isCurrent
          ? "h-7 w-7 sm:h-8 sm:w-8"
          : isSub
            ? "h-5 w-5 sm:h-6 sm:w-6"
            : "h-6 w-6 sm:h-7 sm:w-7";
        const markerTone = isBlunder
          ? isHovered
            ? "border-destructive bg-background text-destructive ring-2 ring-destructive/50"
            : "border-destructive/60 bg-background text-destructive/80"
          : isCurrent
            ? "border-accent bg-accent text-accent-foreground shadow-[0_0_16px_-3px_var(--accent)]"
            : isHovered
              ? "border-accent bg-background text-foreground ring-2 ring-accent/50"
              : "border-foreground/35 bg-background text-muted-foreground/80";

        return (
          <button
            key={`${entry.year}-${entry.location}-${entry.label}`}
            type="button"
            onClick={() => onToggle(i)}
            onMouseEnter={() => onEnter(i)}
            onMouseLeave={() => onLeave(i)}
            onFocus={() => onEnter(i)}
            onBlur={() => onLeave(i)}
            aria-expanded={isHovered}
            aria-label={`${entry.year} — ${entry.location}: ${entry.label}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center transition-transform focus-visible:outline-none ${
              isHovered ? "z-10 scale-[1.15]" : "hover:scale-105"
            } ${isSub && !isHovered ? "opacity-85" : ""}`}
          >
            <span
              aria-hidden
              className={`grid shrink-0 place-items-center rounded-full border p-1 transition-all duration-200 ${markerSize} ${markerTone}`}
            >
              <JourneyIcon kind={entry.icon} />
            </span>
            <span
              className={`font-mono text-[clamp(0.75rem,0.95vw,0.9375rem)] leading-tight ${
                isHovered || isCurrent ? "text-accent" : isBlunder ? "text-destructive/80" : "text-muted-foreground"
              }`}
            >
              {entry.year}
            </span>
            <span
              className={`font-display text-[clamp(0.9375rem,1.25vw,1.1875rem)] uppercase leading-tight ${
                isHovered ? "text-foreground" : "text-foreground/70"
              }`}
            >
              {entry.location}
            </span>
          </button>
        );
      })}

      {/* Info card — only exists while a node is hovered/tapped; this is the
          ONLY place it renders, so there is never more than one on screen
          and the resting state (hovered === null) shows nothing at all.
          pointer-events-none so the card itself never steals the mouseleave
          that would otherwise fight with reading it. Keyed by index so it
          fully remounts (not just re-styles) when the hovered node changes. */}
      {hovered !== null ? (
        <div
          key={hovered}
          style={panelStyle(JOURNEY_LAYOUT[hovered]!)}
          className="pointer-events-none absolute z-20 w-44 max-w-[calc(100vw-2rem)] animate-fade-in rounded-xl border border-accent/40 bg-card/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:w-56 lg:w-60"
        >
          <p className="font-mono text-[0.7rem] tracking-[0.15em] text-accent">
            {entries[hovered]!.year}
            {entries[hovered]!.age ? ` · AGE ${entries[hovered]!.age}` : ""}
          </p>
          <p className="mt-0.5 font-display text-base uppercase leading-tight text-foreground">
            {entries[hovered]!.location}
          </p>
          <p className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">
            {entries[hovered]!.label}
          </p>
          <p className="mt-1.5 text-[0.8rem] leading-snug text-foreground/85">
            {entries[hovered]!.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Page-level regions of the Opening layout, siblings of Journey — not
 * rendered by it. Journey only ever draws the timeline itself; the photo
 * rail and portrait are laid out by Player's grid, exactly like the trait
 * cards and nav are laid out by ChapterLayout's footer rather than by
 * whatever chapter content sits above them.
 */
function OpeningPhotoRail({ photos }: { photos: Photo[] }) {
  return (
    // Each photo takes an equal share of the rail's height rather than a fixed
    // aspect ratio, so the strip stays exactly one viewport tall no matter how
    // many photos the content file lists. object-cover (in PhotoSlot) keeps
    // them undistorted as the derived aspect changes.
    <div className="hidden h-full min-h-0 min-w-0 lg:flex lg:flex-col lg:gap-2">
      {photos.map((p, i) => (
        <PhotoSlot
          key={i}
          photo={p}
          className="flex min-h-0 flex-1 flex-col"
          ratio="min-h-0 flex-1"
          captionClassName="mt-1 shrink-0 font-mono text-[0.55rem] leading-tight tracking-[0.16em] text-muted-foreground"
        />
      ))}
    </div>
  );
}

/** Key to the timeline's icon vocabulary. A sibling of Journey (Journey draws
 *  only the timeline), overlaid on the empty lower-left of the timeline box. */
const JOURNEY_LEGEND: { icon: JourneyIconKind; label: string; danger?: boolean }[] = [
  { icon: "home", label: "HOME / EARLY LIFE" },
  { icon: "book", label: "EXAMS / PREPARATION" },
  { icon: "graduation", label: "EDUCATION" },
  { icon: "x", label: "SETBACK / FAILURE", danger: true },
  { icon: "crown", label: "ACHIEVEMENTS" },
  { icon: "robot", label: "CLUBS / INTERESTS" },
  { icon: "briefcase", label: "WORK / PROFESSIONAL" },
  { icon: "trophy", label: "SPORTS / ACTIVITIES" },
];

function JourneyLegend() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 rounded-xl border border-border/70 bg-card/40 px-4 py-3 backdrop-blur-sm">
      {JOURNEY_LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className={`h-3.5 w-3.5 shrink-0 ${item.danger ? "text-destructive/80" : "text-muted-foreground"}`}
          >
            <JourneyIcon kind={item.icon} />
          </span>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-muted-foreground">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function OpeningPortrait({ portrait, tag }: { portrait: Photo; tag: string }) {
  return (
    <div className="hidden min-w-0 lg:block">
      <PhotoSlot photo={portrait} />
      <p className="mt-2 text-center font-mono text-sm tracking-[0.25em] text-muted-foreground">
        {tag}
      </p>
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
  // null = no journey card shown, the default resting state. Hover shows a
  // node's card; leaving it (or tapping the same node again) clears it.
  const [hoveredJourney, setHoveredJourney] = useState<number | null>(null);
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
        {/* lg:pr-32 keeps the portrait clear of the fixed right chapter rail —
            same clearance pattern used on Blunder/Loreal/Wrapped's content
            containers, needed here for the same reason: at ~1366px wide the
            rail sits at ~1212px and unpadded content runs edge-to-edge. */}
        <div className="mx-auto h-full min-h-0 w-full max-w-7xl lg:pr-32">
          {/* Page-level 3-region layout: OpeningPhotoRail | journey column | OpeningPortrait.
              These are grid SIBLINGS, not children of Journey — Journey only ever draws
              the timeline itself. Columns land on roughly 18% / 65% / 17% of the
              content width, the split the design calls for. */}
          <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[210px_minmax(0,1fr)_190px] lg:gap-x-7 lg:gap-y-3">
            {/* left: memory rail — desktop/tablet only, starts below Sound Off */}
            <Reveal delay={120} className="min-h-0">
              <OpeningPhotoRail photos={c.photos} />
            </Reveal>

            {/* centre: heading + journey, unchanged in size/position */}
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
                  {/* Portrait's own rail is desktop/tablet-only (see OpeningPortrait) —
                      below lg it joins this same page-level strip instead of being
                      anchored inside Journey, so photos stay Journey's siblings on
                      every breakpoint, not just desktop. */}
                  <div className="w-11 shrink-0">
                    <PhotoSlot photo={{ label: c.portrait.label, src: c.portrait.src ?? "" }} ratio="aspect-square" />
                  </div>
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

              {/* Timeline region. Journey and JourneyLegend are SIBLINGS here —
                  Journey renders only the timeline; the legend is overlaid on
                  the empty lower-left that JOURNEY_LAYOUT reserves for it. */}
              <div className="relative min-h-0 flex-1">
                <Reveal delay={160} className="h-full">
                  <Journey
                    entries={c.journey}
                    hovered={hoveredJourney}
                    onEnter={setHoveredJourney}
                    onLeave={(i) => setHoveredJourney((h) => (h === i ? null : h))}
                    onToggle={(i) => setHoveredJourney((h) => (h === i ? null : i))}
                  />
                </Reveal>

                <Reveal
                  delay={300}
                  className="pointer-events-none absolute bottom-0 left-0 hidden xl:block"
                >
                  <JourneyLegend />
                </Reveal>
              </div>
            </div>

            {/* right: portrait — desktop/tablet only, top-aligned below "01 / OPENING" */}
            <Reveal delay={140} className="lg:pt-1">
              <OpeningPortrait portrait={c.portrait} tag={`${content.name} / 01`} />
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

/**
 * A small photo strip — a sibling of the passion-card grid, not a child of
 * it. Fixed image height (not aspect-ratio) keeps its footprint small and
 * predictable regardless of column width, since the card grid above it
 * still owns most of the vertical budget.
 */
function PassionGallery({ photos }: { photos: Photo[] }) {
  return (
    <div className="grid shrink-0 grid-cols-4 gap-2 sm:gap-3">
      {photos.map((photo) => (
        <figure key={photo.label} className="group m-0">
          <div className="h-14 w-full overflow-hidden rounded-lg border border-border/70 transition-colors duration-300 group-hover:border-accent/60 sm:h-16 lg:h-20">
            <img
              src={photo.src}
              alt={photo.label}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <figcaption className="mt-1 text-center font-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground sm:text-[0.6rem]">
            {photo.label}
          </figcaption>
        </figure>
      ))}
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

          {/* Sibling of the card grid above, NOT nested inside any card. */}
          <Reveal delay={480} className="shrink-0">
            <PassionGallery photos={c.gallery} />
          </Reveal>
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
/** accent = full lime (mother), neutral = off-white (father), soft = muted
 *  lime (brother) — three readings of the existing palette, no new hues. */
type FamilyTone = "accent" | "neutral" | "soft";

function FamilyCard({
  person,
  icon,
  tone,
  featured,
}: {
  person: FamilyMember;
  icon: "heart" | "shield" | "hands";
  tone: FamilyTone;
  featured?: boolean;
}) {
  const traitColor =
    tone === "accent" ? "text-accent" : tone === "soft" ? "text-accent/70" : "text-foreground";
  return (
    <div
      className={`group relative flex h-full flex-col justify-center rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 sm:min-h-[300px] sm:p-6 ${
        featured
          ? "border-accent/50 bg-secondary lg:scale-[1.03]"
          : "border-border/80 bg-secondary/70 hover:border-accent/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
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
        {/* small reserved corner frame — real photos drop straight in later
            without touching layout; kept small so it stays an accent, not
            the card's main event. */}
        <PhotoSlot
          photo={person.photo}
          ratio="aspect-square"
          className="w-11 shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <h3
        className={`mt-3 font-display text-2xl uppercase leading-none tracking-tight transition-colors duration-300 sm:text-[1.75rem] ${traitColor}`}
      >
        {person.trait}
      </h3>

      <p className="mt-2 text-[0.8rem] leading-snug text-foreground/75 transition-colors duration-300 group-hover:text-foreground/90 sm:text-[0.85rem]">
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
      {/* justify-center groups heading + cards + closing line as one block and
          centres it in the available height — the cards size to their own
          content (height: auto) instead of stretching to fill the chapter. */}
      {/* lg:pr-32 clears the fixed right chapter rail — same pattern already
          used on Blunder/Loreal/Player's content containers; at ~1366px wide
          the rail sits at ~1212px and unpadded content ran past it. */}
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-center gap-5 lg:pr-32">
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

        <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Reveal delay={200} className="h-full">
            <FamilyCard person={c.mother} icon="heart" tone="accent" />
          </Reveal>
          <Reveal delay={280} className="h-full">
            <FamilyCard person={c.father} icon="shield" tone="neutral" featured />
          </Reveal>
          <Reveal delay={360} className="h-full">
            <FamilyCard person={c.brother} icon="hands" tone="soft" />
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
  image,
  onOpen,
}: {
  item: AnalysisItem;
  index: number;
  image: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.title} — trait analysis`}
      className="group flex h-full w-full flex-col items-center overflow-hidden rounded-2xl border border-accent/25 bg-card/40 p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-[0_0_36px_-16px_var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:p-5"
    >
      <span className="font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="mt-2 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 p-2 text-accent transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
        <AnalysisIcon kind={item.icon} />
      </span>
      <h3 className="mt-2.5 font-display text-sm uppercase leading-tight tracking-tight text-foreground sm:text-base lg:text-lg">
        {item.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-[0.72rem] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/80 sm:line-clamp-none sm:text-[0.8rem]">
        {item.text}
      </p>
      {/* Fixed height (not aspect-ratio) so the image's contribution to the
          card's total height is predictable — grown from its original 80/96px
          to fill the room freed by removing the quote block below the cards. */}
      <div className="mt-3 h-28 w-full shrink-0 overflow-hidden rounded-lg border border-border/70 sm:h-32">
        <img
          src={image}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <span
        className="mt-auto pt-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent opacity-60 transition-opacity group-hover:opacity-100"
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
        {/* lg:pr-* keeps content clear of the fixed chapter rail, matching Blunder.
            justify-center groups hero + cards + quote and centres them as one
            block — the cards size to their own content instead of the grid
            forcing itself to fill the chapter (same fix as the Beauty page). */}
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-center gap-2 sm:gap-3 lg:pr-32">
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

          <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {c.traits.map((item, i) => (
              <Reveal key={item.title} delay={200 + i * 60} className="h-full">
                <TraitMatchCard item={item} index={i} image={item.image} onOpen={() => setOpenIndex(i)} />
              </Reveal>
            ))}
          </div>
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
      className="group flex w-full items-center gap-3 py-5 text-left transition-colors first:pt-0 last:pb-0 sm:gap-4 sm:py-7"
    >
      <span className={`shrink-0 font-display text-2xl leading-none opacity-60 transition-opacity group-hover:opacity-100 sm:text-3xl ${toneText}`}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border p-2 transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11 ${toneBorder} ${toneText}`}
      >
        <AnalysisIcon kind={item.icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base uppercase leading-tight tracking-tight text-foreground transition-colors sm:text-lg lg:text-xl">
          {item.title}
        </span>
        <span className="mt-1 block text-[0.78rem] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/80 sm:text-sm">
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
      {/* flex + justify-evenly spreads the 3 rows across the panel's full
          height with even breathing room above, between and below — instead
          of block-stacking them at the top and leaving the remainder of the
          flex-1 container empty below. */}
      <div className="mt-1 flex min-h-0 flex-1 flex-col justify-evenly divide-y divide-border/50 overflow-hidden text-foreground sm:mt-2">
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
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-card/40 p-2 transition-all duration-300 hover:-translate-y-1 sm:p-2.5 ${toneBorder} ${toneGlow}`}
    >
      <p className={`font-mono text-[0.6rem] tracking-[0.2em] ${toneText}`}>
        {String(index + 1).padStart(2, "0")} / {card.label}
      </p>

      <div className="mt-1 flex-1">
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
            <h3 className="mt-1.5 font-display text-lg uppercase leading-[0.9] sm:text-xl">
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
            <p className="mt-1 text-center font-display text-2xl leading-none text-accent sm:text-3xl">
              {card.score}
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
              <span aria-hidden>♞</span>
              {card.round} · MATCH ANALYSIS
            </div>
          </>
        ) : card.kind === "thought" ? (
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg uppercase leading-[0.95] sm:text-xl">
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
            <h3 className="font-display text-base uppercase leading-[0.95] text-destructive sm:text-lg">
              {card.text}
            </h3>
            <span className="mt-0.5 shrink-0 text-lg text-destructive" aria-hidden>
              ⚠
            </span>
          </div>
        ) : card.kind === "twist" ? (
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{card.from}</p>
            <p className="my-0.5 text-accent" aria-hidden>
              ↓
            </p>
            <h3 className="font-display text-lg uppercase leading-[0.95] text-accent sm:text-xl">
              {card.to}
            </h3>
          </div>
        ) : (
          // `ratio` is just inserted as a class string — a fixed height here
          // (rather than an aspect-ratio) keeps this card's contribution to
          // its row predictable, matching the other five compact cards.
          <PhotoSlot photo={card.photo} ratio="h-16 sm:h-20" className="mb-1" />
        )}
      </div>

      {card.kind === "experience" ? (
        <h3 className="mt-1 font-display text-sm uppercase leading-tight sm:text-base">
          {card.title}
        </h3>
      ) : null}
      <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground transition-colors group-hover:text-foreground/80">
        {card.caption}
      </p>
    </div>
  );
}

function FinalWrappedCard({ final }: { final: typeof content.wrapped.final }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/40 bg-card/60 p-2 text-center shadow-[0_0_50px_-22px_var(--accent)] sm:p-2.5">
      <div className="grain pointer-events-none absolute inset-0 opacity-20" aria-hidden />
      <p className="relative font-mono text-xs tracking-[0.3em] text-accent">{final.label}</p>
      <span className="relative mt-1 inline-block text-lg text-accent sm:text-xl" aria-hidden>
        ♚
      </span>
      <h3 className="relative mt-1 font-display text-base uppercase leading-[0.95] sm:text-lg lg:text-xl">
        {final.lines[0]}
      </h3>
      <h3 className="relative mt-0.5 font-display text-base uppercase leading-[0.95] text-accent sm:text-lg lg:text-xl">
        {final.lines[1]}
      </h3>
      <span className="relative mt-1.5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 font-mono text-xs uppercase tracking-[0.25em] text-accent">
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
      footer={<MoveNav onPrev={onPrev} onNext={onNext} />}
    >
      {/* justify-center groups hero + cards + final card + outro as one block
          and centres it — same fixed, no-scroll pattern every other chapter
          uses, once every piece here is compact enough to actually fit it (true
          from lg up, where this was verified against the desktop requirement).
          Below lg the 6 cards stack into one column and no longer fit — rather
          than clip them, this falls back to a top-aligned, internally
          scrollable column (justify-center's overflow-scroll behaviour is
          unreliable in flexbox, hence justify-start instead of centering an
          overflowing box). */}
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-start gap-1 overflow-y-auto lg:justify-center lg:overflow-hidden lg:pr-32">
        <div className="shrink-0 text-center">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground">{c.eyebrow}</p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className="mt-0.5 font-display text-[clamp(1.5rem,4.5vw,2.5rem)] uppercase leading-[0.85]">
              <span className="text-accent">{content.name}</span> WRAPPED
            </h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="mx-auto mt-0.5 max-w-xl font-mono text-xs tracking-[0.2em] text-muted-foreground sm:text-sm">
              {c.subtitle}
            </p>
          </Reveal>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1.5 lg:grid-cols-3">
          {c.cards.map((card, i) => (
            <Reveal key={card.label} delay={160 + (i % 3) * 50} className="h-full">
              <WrappedCard index={i} card={card} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={340} className="shrink-0">
          <FinalWrappedCard final={c.final} />
        </Reveal>

        <Reveal delay={400} className="shrink-0 text-center">
          <p className="font-display text-sm uppercase tracking-tight sm:text-base">
            {c.outro.thanks}
          </p>
          <p className="mt-0.5 font-mono text-[0.7rem] tracking-[0.25em] text-accent sm:text-xs">
            {c.outro.line}
          </p>
        </Reveal>
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
      header={
        // Same lg:pl-24 clearance pattern as Blunder/Loreal/Wrapped's headers.
        <div className="flex min-h-11 items-center justify-between gap-4 lg:min-h-0 lg:pl-24">
          <Reveal className="hidden lg:block">
            <p className="font-mono text-sm tracking-[0.3em] text-accent">07 / 07</p>
          </Reveal>
          <Reveal className="ml-auto">
            <p className="flex items-center gap-2 font-mono text-sm tracking-[0.3em] text-muted-foreground">
              {c.chapter}
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
            </p>
          </Reveal>
        </div>
      }
      footer={
        <Reveal delay={100} className="flex flex-col items-center gap-2">
          <div className="flex w-full items-center justify-between gap-3">
            <PrevMoveButton onClick={onPrev} />
            <NextMoveButton onClick={onReplay} label="Play again →" />
          </div>
          <p className="font-mono text-[0.65rem] tracking-[0.25em] text-muted-foreground/60">
            {content.name} WRAPPED · {content.year}
          </p>
        </Reveal>
      }
    >
      {/* lg:pr-* keeps content clear of the fixed chapter rail, matching every
          other chapter. justify-center groups the hero row + closing block
          and centres them as one block within the available height. */}
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col justify-center gap-5 lg:pr-32">
        <div className="grid shrink-0 gap-6 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-10">
          <Reveal className="mx-auto lg:mx-0">
            <Chessboard pieces={pieces} size={BOARD_SIZE_ENDGAME} />
            {/* The board above is replayed from MOVES, so this is the real
                final position — the notation is read from the same source. */}
            <p className="mt-3 text-center font-mono text-xs tracking-[0.25em] text-accent lg:text-left">
              {FINAL_MOVE.notation} · CHECKMATE
            </p>
            <p className="mt-1 text-center font-mono text-sm tracking-[0.2em] text-muted-foreground lg:text-left">
              SAME BOARD. DIFFERENT <span className="text-accent">POSITION.</span>
            </p>
          </Reveal>

          <div className="min-w-0 text-center lg:text-left">
            <Reveal>
              <h2 className="font-display text-[clamp(2rem,6vw,4rem)] uppercase leading-[0.86]">
                THE GAME <span className="text-accent">ISN&apos;T OVER.</span>
              </h2>
            </Reveal>
            <div className="mt-2 space-y-0.5">
              {c.lines.map((l, i) => (
                <Reveal key={l} delay={i * 60}>
                  <p className="font-display text-base text-muted-foreground sm:text-lg">{l}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={140} className="hidden sm:block">
              <div className="mx-auto mt-3 max-w-sm rounded-xl border border-border bg-card/60 px-4 py-3 lg:mx-0">
                <p className="font-mono text-xs tracking-[0.25em] text-accent">GAME STATUS</p>
                <dl className="mt-1.5 divide-y divide-border/70">
                  {c.status.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-4 py-1.5">
                      <dt className="font-mono text-xs tracking-[0.1em] text-muted-foreground">
                        {s.label.toUpperCase()}
                      </dt>
                      <dd className="font-display text-sm uppercase text-foreground">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="shrink-0 text-center">
          {c.final.map((l, i) => (
            <Reveal key={l} delay={i * 100}>
              <p className="mx-auto max-w-3xl font-display text-xl uppercase leading-tight sm:text-3xl">
                {l}
              </p>
            </Reveal>
          ))}
          <Reveal delay={220}>
            <p className="mt-2 font-mono text-xs tracking-[0.3em] text-accent sm:text-sm">
              {c.signoff}
            </p>
          </Reveal>
        </div>
      </div>
    </ChapterLayout>
  );
}
