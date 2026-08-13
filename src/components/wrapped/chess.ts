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

/** One coherent game: Italian-ish opening, a blunder, then a bare endgame. */
export const MOVES: Move[] = [
  { from: "e2", to: "e4", notation: "1. e4", hint: "Open the game. Push the glowing pawn forward." },
  { from: "e7", to: "e5", notation: "1… e5", hint: "The other side answers. Move the glowing pawn." },
  { from: "g1", to: "f3", notation: "2. Nf3", hint: "Develop the knight towards the centre." },
  { from: "b8", to: "c6", notation: "2… Nc6", hint: "Bring the black knight out." },
  { from: "f1", to: "c4", notation: "3. Bc4", hint: "Aim the bishop at the weakest square." },
  { from: "e1", to: "g1", notation: "4. 0-0", hint: "Castle. Tuck the king away.", also: { from: "h1", to: "f1" } },
  { from: "c6", to: "d4", notation: "4… Nd4?", hint: "Move the knight. This one is a mistake." },
  { from: "f3", to: "d4", notation: "5. Nxd4", hint: "Take the knight. Endgames are made of these." },
];

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
