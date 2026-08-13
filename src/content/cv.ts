/**
 * ─────────────────────────────────────────────────────────────
 *  PRANAV WRAPPED — THE CHESS EDITION
 *  ALL EDITABLE CONTENT LIVES HERE. Nothing else needs touching.
 *  Replace every [BRACKETED] placeholder with your real words.
 *  Photos: drop files in /public/photos/ and set the `src` fields.
 * ─────────────────────────────────────────────────────────────
 */

export type Photo = {
  label: string;
  /** e.g. "/photos/portrait.jpg" — leave empty to keep the placeholder frame */
  src?: string;
  caption?: string;
};

export const content = {
  name: "PRANAV",
  age: "25",
  year: "2026",
  subtitle: "PRANAV WRAPPED · 2026",

  intro: {
    chapter: "OPENING",
    title: "MEET THE PLAYER",
    subtitle: "Before the moves, there was the player.",
    /** Write this the way you'd say it out loud, not the way you'd write it on LinkedIn. */
    voice:
      "[SHORT INTRO IN YOUR OWN VOICE — 3 or 4 sentences. Who you are on an ordinary Tuesday, not on a CV. What you're curious about. What you're bad at pretending to care about.]",
    portrait: { label: "PHOTO — PORTRAIT", src: "", caption: "[optional caption]" } as Photo,
    traits: [
      "[TRAIT 01]",
      "[TRAIT 02]",
      "[TRAIT 03]",
      "[TRAIT 04]",
      "[TRAIT 05]",
    ],
    mostLikelyTo: "[PERSONAL QUIRK — the thing your friends would bet money on you doing]",
    operatingSystem:
      "[SHORT PERSONAL DESCRIPTION — how your head currently runs. One or two lines.]",
  },

  passions: {
    chapter: "DEVELOPMENT",
    title: "WHAT I PLAY WHEN NOBODY IS WATCHING",
    subtitle: "Top genres. No skips.",
    cards: [
      {
        glyph: "♟",
        title: "CHESS",
        minutes: 0, // optional fake-stat counter; set a number you're happy showing
        text: "[WHY YOU GENUINELY ENJOY IT — not 'it teaches strategy'. The actual feeling.]",
        photo: { label: "PHOTO — CHESS", src: "" } as Photo,
      },
      {
        glyph: "⚽",
        title: "FOOTBALL",
        minutes: 0,
        text: "[WHY YOU ENJOY IT]",
        photo: { label: "PHOTO — FRIENDS / TEAM", src: "" } as Photo,
      },
      {
        glyph: "📚",
        title: "READING / FICTION",
        minutes: 0,
        text: "[WHY YOU ENJOY IT]",
      },
      {
        glyph: "✳",
        title: "[OTHER PASSION]",
        minutes: 0,
        text: "[WHY YOU ENJOY IT]",
      },
    ],
    mostPlayed: "[PASSION]",
    mostUnexpected: "[UNEXPECTED INTEREST]",
    currentObsession: "[CURRENT OBSESSION]",
  },

  competitive: {
    chapter: "ATTACK",
    title: "I LIKE COMPETING.",
    subtitle: "But it took me a while to work out why.",
    /** 0 = purely winning · 100 = purely getting better. Move the needle honestly. */
    scale: 62,
    scaleLeft: "WINNING",
    scaleRight: "GETTING BETTER",
    text: "[YOUR ACTUAL RELATIONSHIP WITH COMPETITION — where the needle really sits and what that costs you.]",
    /** Text shown as the viewer drags the needle. Four honest positions, left → right. */
    zones: [
      "[WHAT IT LOOKS LIKE WHEN I ONLY WANT TO WIN]",
      "[MOSTLY WINNING, A LITTLE LEARNING]",
      "[WHERE THE NEEDLE ACTUALLY SITS MOST DAYS]",
      "[WHAT IT LOOKS LIKE WHEN I ONLY WANT TO IMPROVE]",
    ],
    stats: [
      { label: "FAVOURITE FEELING", value: "[TEXT]" },
      { label: "LEAST FAVOURITE FEELING", value: "[TEXT]" },
      { label: "LESSON LEARNED", value: "[TEXT]" },
    ],
  },

  beauty: {
    chapter: "SACRIFICE",
    title: "BEAUTY, ACCORDING TO PRANAV",
    used_to_think: "[WHAT YOU USED TO THINK BEAUTY WAS — be specific, even if it's unflattering.]",
    now_think: "[WHAT YOU THINK NOW — and what changed your mind.]",
    definitions: [
      { concept: "[CONCEPT 1]", text: "[PERSONAL EXPLANATION]" },
      { concept: "[CONCEPT 2]", text: "[PERSONAL EXPLANATION]" },
      { concept: "[CONCEPT 3]", text: "[PERSONAL EXPLANATION]" },
    ],
    memory: {
      label: "PHOTO — PERSONAL MEMORY",
      src: "",
      caption: "[the moment this section is actually about]",
    } as Photo,
  },

  loreal: {
    title: "IF I WERE A L'ORÉAL BRAND…",
    brand: "[BRAND NAME]",
    brandLine: "[ONE LINE ON WHAT THAT BRAND FEELS LIKE TO YOU]",
    reasons: [
      { label: "WHY #1", text: "[PERSONAL CONNECTION]" },
      { label: "WHY #2", text: "[PERSONAL CONNECTION]" },
      { label: "WHY #3", text: "[PERSONAL CONNECTION]" },
    ],
    notIdentical:
      "[HONEST DIFFERENCE BETWEEN YOU AND THE BRAND — where you'd disagree with it.]",
  },

  blunder: {
    chapter: "BLUNDER",
    title: "NOBODY PLAYS A PERFECT GAME.",
    headline: "MY MOST REPEATED BLUNDER",
    name: "[REAL WEAKNESS — in plain words, no perfectionist clichés]",
    rows: [
      { label: "WHAT I DO", text: "[WEAKNESS]" },
      { label: "WHY I THINK I DO IT", text: "[REFLECTION]" },
      { label: "WHEN IT HURTS ME", text: "[REAL CONSEQUENCE]" },
      { label: "WHAT I'M TRYING TO CHANGE", text: "[WHAT YOU'RE ACTUALLY DOING ABOUT IT]" },
    ],
    second: {
      name: "I BARELY TAKE PHOTOGRAPHS OF MYSELF.",
      text: "Apparently, I've spent years documenting things I found interesting and almost no time documenting myself.",
      reflection:
        "[WHAT YOU THINK THAT SAYS ABOUT YOU — keep it light, but mean it. This is also why this site has empty photo frames.]",
    },
  },

  wrapped: {
    title: "YOUR YEAR IN REVIEW",
    subtitle: "No algorithm. Just an honest tally.",
    cards: [
      { label: "MOST PLAYED", value: "[PASSION]" },
      { label: "MOST WATCHED", value: "[PASSION]" },
      { label: "MOST REPEATED THOUGHT", value: "[TEXT]" },
      { label: "MOST REPEATED MISTAKE", value: "[TEXT]" },
      { label: "BIGGEST PLOT TWIST", value: "[TEXT]" },
      { label: "MOST UNDERRATED EXPERIENCE", value: "[TEXT]" },
    ],
    numbers: [
      { value: 1247, label: "GAMES PLAYED", suffix: "" },
      { value: 96, label: "OPENINGS I STILL GET WRONG", suffix: "" },
      { value: 3, label: "OPINIONS I CHANGED THIS YEAR", suffix: "" },
    ],
    mood: "STILL FIGURING IT OUT.",
  },

  endgame: {
    chapter: "ENDGAME",
    title: "THE NEXT MOVE",
    lines: [
      "25 YEARS IN.",
      "A FEW GOOD MOVES.",
      "A FEW TERRIBLE ONES.",
      "SEVERAL POSITIONS I STILL DON'T UNDERSTAND.",
    ],
    status: [
      { label: "Opening", value: "Complete" },
      { label: "Development", value: "Ongoing" },
      { label: "Blunders", value: "Plenty" },
      { label: "Lessons", value: "Hopefully more" },
      { label: "Endgame", value: "Unknown" },
    ],
    final: ["I don't know exactly where the game is going.", "But I know I want to keep playing."],
    signoff: "THANKS FOR PLAYING. ♟",
  },

  /** Click a piece on any chessboard to reveal these. All editable. */
  easterEggs: {
    king: { title: "YOU FOUND THE KING.", text: "[SOMETHING YOU PROTECT AT ALL COSTS]" },
    queen: { title: "EVERYONE CLICKS THE QUEEN FIRST.", text: "[PERSONAL JOKE]" },
    rook: { title: "THE ROOK WAITS.", text: "[A TIME PATIENCE PAID OFF]" },
    bishop: { title: "THE BISHOP ONLY SEES ONE COLOUR.", text: "[A BIAS YOU'RE WORKING ON]" },
    knight: { title: "YOU FOUND THE KNIGHT.", text: "[PERSONAL FUN FACT]" },
    pawn: { title: "MOST IMPORTANT THINGS STARTED SMALL.", text: "[PERSONAL STORY]" },
  },

  chapters: ["OPENING", "DEVELOPMENT", "ATTACK", "BLUNDER", "SACRIFICE", "ENDGAME"] as const,
};

export type Content = typeof content;
