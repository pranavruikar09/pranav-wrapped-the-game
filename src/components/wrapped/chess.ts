/**
 * A tiny, deliberately dumb chess model.
 * It does not validate anything — it plays ONE predetermined, coherent
 * sequence of moves so the board can act as the site's navigation.
 */

export type PieceCode =
  | "K" | "Q" | "R" | "B" | "N" | "P"
  | "k" | "q" | "r" | "b" | "n" | "p";

export type Piece = { id: string; sq: string; code: PieceCode };

export type Move = {
  /** Square the highlighted piece starts on */
  from: string;
  /** Square it lands on */
  to: string;
  /** Short human instruction, e.g. "Push the pawn two squares forward." */
  hint: string;
  /** Algebraic-ish caption shown under the board */
  notation: string;
  /** Extra piece movement (castling rook) */
  also?: { from: string; to: string };
};

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function startingPieces(): Piece[] {
  const out: Piece[] = [];
  START.split("/").forEach((row, r) => {
    let f = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        f += Number(ch);
      } else {
        const sq = `${FILES[f]}${8 - r}`;
        out.push({ id: `${ch}${sq}`, sq, code: ch as PieceCode });
        f += 1;
      }
    }
  });
  return out;
}

/**
 * Scholar's Mate — seven half-moves, one per content chapter, ending on a
 * real checkmate rather than a position that merely looks like one. Every
 * entry is the legal consequence of the one before it, so `positionAfter`
 * reaches the mate by replaying the line rather than by hand-placing pieces.
 *
 * Why it's mate after 4. Qxf7#: the queen sits adjacent to the black king and
 * is defended by the c4 bishop (c4–d5–e6–f7 is clear). The king has no square
 * (d7/d8/f8 are its own pieces, e7 is covered by the queen, f7 is defended);
 * nothing black has can take on f7 (neither knight covers it, the f8 bishop
 * can't move down a file, d8–f7 isn't a queen line); and there is no square
 * between f7 and e8 to interpose on.
 */
export const MOVES: Move[] = [
  { from: "e2", to: "e4", notation: "1. e4", hint: "Open the game. Push the glowing pawn forward." },
  { from: "e7", to: "e5", notation: "1… e5", hint: "The other side answers. Move the glowing pawn." },
  { from: "d1", to: "h5", notation: "2. Qh5", hint: "Bring the queen out early. Confident, or reckless." },
  { from: "b8", to: "c6", notation: "2… Nc6", hint: "Black defends the pawn. Sensible enough." },
  { from: "f1", to: "c4", notation: "3. Bc4", hint: "Aim the bishop at the weakest square." },
  { from: "g8", to: "f6", notation: "3… Nf6??", hint: "Black develops — and misses what's coming." },
  { from: "h5", to: "f7", notation: "4. Qxf7#", hint: "Take on f7. That's the game." },
];

/** The move the game ends on. Read from MOVES so the Endgame page's caption
 *  can never drift out of sync with the line actually being played. */
export const FINAL_MOVE = MOVES[MOVES.length - 1]!;

/** Apply the first `count` moves to the starting position. */
export function positionAfter(count: number): Piece[] {
  let pieces = startingPieces();
  for (let i = 0; i < Math.min(count, MOVES.length); i++) {
    const m = MOVES[i]!;
    pieces = applyMove(pieces, m);
  }
  return pieces;
}

export function applyMove(pieces: Piece[], move: Move): Piece[] {
  const moves = [{ from: move.from, to: move.to }, ...(move.also ? [move.also] : [])];
  let next = pieces;
  for (const m of moves) {
    next = next
      .filter((p) => !(p.sq === m.to && p.sq !== m.from))
      .map((p) => (p.sq === m.from ? { ...p, sq: m.to } : p));
  }
  return next;
}

export function squareToXY(sq: string) {
  const file = FILES.indexOf(sq[0] as (typeof FILES)[number]);
  const rank = Number(sq[1]);
  return { left: file * 12.5, top: (8 - rank) * 12.5 };
}
