import { useMemo } from "react";
import { content } from "@/content/cv";
import { playTick } from "./sound";

type PieceKey = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

const GLYPH: Record<string, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const NAME: Record<string, PieceKey> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};

/**
 * The board is a storytelling device, not a game.
 * Each stage is a position further into the story.
 */
const STAGES = [
  // 0 — starting position (OPENING)
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
  // 1 — first moves (DEVELOPMENT)
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R",
  // 2 — pieces active (ATTACK)
  "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1",
  // 3 — something goes wrong (BLUNDER)
  "r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1",
  // 4 — a piece is given up on purpose (SACRIFICE)
  "r1bqk2r/pppp1Bpp/2n5/4p3/4n3/5N2/PPPP1PPP/RNBQ1RK1",
  // 5 — few pieces, long game (ENDGAME)
  "8/5k2/4p3/8/2P5/5K2/8/8",
];

function parse(fen: string) {
  const out: { sq: string; code: string }[] = [];
  const files = "abcdefgh";
  fen.split("/").forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        f += Number(ch);
      } else {
        out.push({ sq: `${files[f]}${8 - r}`, code: ch });
        f += 1;
      }
    }
  });
  return out;
}

export function Chessboard({
  stage = 0,
  size = "min(78vmin, 30rem)",
  interactive = true,
  onEgg,
  className = "",
}: {
  stage?: number;
  size?: string;
  interactive?: boolean;
  onEgg?: (key: PieceKey) => void;
  className?: string;
}) {
  const pieces = useMemo(() => parse(STAGES[Math.min(stage, STAGES.length - 1)]!), [stage]);
  const files = "abcdefgh".split("");

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-label="Chessboard illustrating the current chapter of the story"
    >
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 overflow-hidden rounded-md border border-border">
        {Array.from({ length: 64 }).map((_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const dark = (r + c) % 2 === 1;
          return (
            <div
              key={i}
              className={dark ? "bg-board-dark" : "bg-board-light"}
              aria-hidden
            />
          );
        })}
      </div>

      {pieces.map(({ sq, code }) => {
        const file = files.indexOf(sq[0]!);
        const rank = Number(sq[1]);
        const key = NAME[code.toLowerCase()]!;
        const white = code === code.toUpperCase();
        return (
          <button
            key={sq + code}
            type="button"
            tabIndex={interactive ? 0 : -1}
            aria-label={`${white ? "White" : "Black"} ${key}`}
            onClick={
              interactive
                ? () => {
                    playTick(white ? 380 : 300);
                    onEgg?.(key);
                  }
                : undefined
            }
            className={`piece absolute grid place-items-center leading-none transition-[left,top,transform,filter] duration-[900ms] ${
              interactive ? "cursor-pointer hover:scale-110 hover:drop-shadow-[0_0_10px_var(--accent)]" : "pointer-events-none"
            } ${white ? "text-piece-light" : "text-piece-dark"}`}
            style={{
              width: "12.5%",
              height: "12.5%",
              left: `${file * 12.5}%`,
              top: `${(8 - rank) * 12.5}%`,
              fontSize: "9cqw",
            }}
          >
            <span style={{ fontSize: "clamp(1rem, 7vmin, 2.4rem)" }}>{GLYPH[code]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function EggCard({
  eggKey,
  onClose,
}: {
  eggKey: PieceKey | null;
  onClose: () => void;
}) {
  if (!eggKey) return null;
  const egg = content.easterEggs[eggKey];
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-6 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-w-md rounded-xl border border-accent/40 bg-card p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-mono text-[0.65rem] tracking-[0.3em] text-accent">EASTER EGG</div>
        <h3 className="mt-4 font-display text-3xl uppercase leading-[0.95]">{egg.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{egg.text}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 font-mono text-[0.7rem] tracking-[0.25em] text-foreground underline decoration-accent decoration-2 underline-offset-4"
        >
          RESUME GAME
        </button>
      </div>
    </div>
  );
}
