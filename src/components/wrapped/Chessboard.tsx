import { squareToXY, type Move, type Piece } from "./chess";

const GLYPH: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

const NAME: Record<string, string> = {
  k: "king", q: "queen", r: "rook", b: "bishop", n: "knight", p: "pawn",
};

/**
 * The board is the navigation. When `move` is provided, exactly one piece
 * and one destination square glow — click either to play it.
 */
export function Chessboard({
  pieces,
  move,
  size = "min(74vmin, 30rem)",
  onPlay,
  dim = false,
  className = "",
}: {
  pieces: Piece[];
  move?: Move | null;
  size?: string;
  onPlay?: () => void;
  dim?: boolean;
  className?: string;
}) {
  const target = move ? squareToXY(move.to) : null;

  return (
    <div
      className={`relative select-none ${dim ? "opacity-70" : ""} ${className}`}
      style={{ width: size, height: size, containerType: "size" }}
      aria-label="Chessboard showing the current position of the story"
    >
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 overflow-hidden border border-border">
        {Array.from({ length: 64 }).map((_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const dark = (r + c) % 2 === 1;
          return <div key={i} className={dark ? "bg-board-dark" : "bg-board-light"} aria-hidden />;
        })}
      </div>

      {/* destination square */}
      {target && onPlay ? (
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Move to ${move!.to}`}
          className="absolute grid place-items-center"
          style={{ width: "12.5%", height: "12.5%", left: `${target.left}%`, top: `${target.top}%` }}
        >
          <span className="h-[34%] w-[34%] animate-pulse rounded-full bg-accent/80 shadow-[0_0_24px_var(--accent)]" />
        </button>
      ) : null}

      {pieces.map((p) => {
        const { left, top } = squareToXY(p.sq);
        const white = p.code === p.code.toUpperCase();
        const isMover = !!move && p.sq === move.from;
        return (
          <button
            key={p.id}
            type="button"
            tabIndex={isMover && onPlay ? 0 : -1}
            aria-label={`${white ? "White" : "Black"} ${NAME[p.code.toLowerCase()]} on ${p.sq}`}
            onClick={isMover && onPlay ? onPlay : undefined}
            className={`absolute grid place-items-center leading-none transition-[left,top,transform,filter] duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              white ? "text-piece-light" : "text-piece-dark"
            } ${
              isMover && onPlay
                ? "z-10 cursor-pointer drop-shadow-[0_0_14px_var(--accent)] hover:scale-110"
                : "pointer-events-none"
            }`}
            style={{ width: "12.5%", height: "12.5%", left: `${left}%`, top: `${top}%` }}
          >
            <span style={{ fontSize: "9cqw", lineHeight: 1 }}>{GLYPH[p.code]}</span>
            {isMover && onPlay ? (
              <span className="absolute inset-[6%] animate-pulse rounded-full border-2 border-accent" aria-hidden />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
