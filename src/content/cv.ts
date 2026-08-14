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
  subtitle: "PRANAV WRAPPED · 25 YEARS, STILL LOADING...",

  intro: {
    chapter: "OPENING",
    title: "HOW DID I GET HERE?",
    subtitle: "A small-town start, a lot of moving around, and a few unexpected turns.",
    /** Write this the way you'd say it out loud, not the way you'd write it on LinkedIn. */
    voice:
      "[SHORT INTRO IN YOUR OWN VOICE — 3 or 4 sentences. Who you are on an ordinary Tuesday, not on a CV. What you're curious about. What you're bad at pretending to care about.]",
    portrait: { label: "PHOTO — PORTRAIT", src: "", caption: "[optional caption]" } as Photo,
    /** Three small personal photos for the journey page. Add real files under /public and set `src`. */
    photos: [
      { label: "PHOTO — SMALL-TOWN ROOTS", src: "", caption: "SMALL-TOWN ROOTS" },
      { label: "PHOTO — HOSTEL LIFE", src: "", caption: "HOSTEL LIFE" },
      { label: "PHOTO — A NEW CHAPTER", src: "", caption: "A NEW CHAPTER" },
    ] as Photo[],
    /**
     * The journey map. Order matters — it's drawn as a path in this order.
     * `kind`: "start" | "normal" | "sub" | "blunder" | "current".
     * "sub" entries are minor milestones that branch off their nearest
     * "normal"/"start" neighbour instead of sitting on the main route.
     */
    journey: [
      {
        year: "2001",
        location: "SALWADGAON",
        label: "WHERE IT STARTED",
        description: "Born in Salwadgaon, a small village in Maharashtra.",
        kind: "start",
      },
      {
        year: "2005",
        age: "4",
        location: "AHMEDNAGAR",
        label: "HOSTEL LIFE BEGINS",
        description:
          "Moved to a hostel at the age of four. Apparently, independence started early.",
        kind: "normal",
      },
      {
        year: "2009",
        age: "8",
        location: "SHEVGAON",
        label: "BACK HOME",
        description:
          "Returned to Shevgaon, my hometown. Completed the rest of my schooling here until Class 10.",
        kind: "normal",
      },
      {
        year: "2012",
        location: "SCHOOL",
        label: "HOUSE CAPTAIN",
        description: "Became House Captain.",
        kind: "sub",
      },
      {
        year: "2014",
        location: "SCHOOL",
        label: "HEAD BOY",
        description: "Became School Head Boy.",
        kind: "sub",
      },
      {
        year: "2015",
        location: "PUNE",
        label: "THE PLAN",
        description: "Moved to Pune for JEE preparation.",
        kind: "normal",
      },
      {
        year: "2015",
        location: "JEE",
        label: "FIRST BLUNDER",
        description: "Didn't clear JEE. Not quite the move I'd planned.",
        kind: "blunder",
      },
      {
        year: "2016",
        location: "KARAD",
        label: "ENGINEERING",
        description:
          "Joined a Government College in Karad. Electronics & Telecommunication Engineering.",
        kind: "normal",
      },
      {
        year: "2022",
        location: "KARAD",
        label: "ROBOTICS CLUB",
        description: "President of the Robotics Club.",
        kind: "sub",
      },
      {
        year: "2023",
        location: "KARAD",
        label: "INDOOR GAMES",
        description: "Head of the Indoor Games Committee.",
        kind: "sub",
      },
      {
        year: "2024",
        location: "PUNE",
        label: "FIRST JOB",
        description: "Joined Lear Corporation for my first job.",
        kind: "normal",
      },
      {
        year: "2025",
        location: "CAT",
        label: "ANOTHER BLUNDER",
        description: "Didn't clear CAT on my first attempt.",
        kind: "blunder",
      },
      {
        year: "2026",
        location: "MUMBAI",
        label: "CURRENT POSITION",
        description: "Joined my dream college — IIM Mumbai.",
        kind: "current",
      },
    ] as {
      year: string;
      age?: string;
      location: string;
      label: string;
      description: string;
      kind: "start" | "normal" | "sub" | "blunder" | "current";
    }[],
    /** What the journey made you, not a repeat of the journey itself. */
    traits: [
      {
        trait: "OPEN-MINDED",
        text: "Moving through very different environments taught me that my way isn't necessarily the only way. I genuinely enjoy hearing how other people approach the same problem.",
      },
      {
        trait: "SELF-RELIANT",
        text: "Responsibility became a default setting for me rather than something I consciously learned. I am usually comfortable figuring things out before asking someone else to do it for me.",
      },
      {
        trait: "CURIOUS",
        text: "I tend to ask one more question than necessary. Sometimes that leads somewhere useful. Sometimes it leads to a 20-minute rabbit hole.",
      },
      {
        trait: "ADAPTABLE",
        text: "[WHY THIS TRAIT — one or two honest sentences about landing in new places/situations and adjusting fast.]",
      },
    ],
    mostLikelyTo: "[PERSONAL QUIRK — the thing your friends would bet money on you doing]",
    operatingSystem:
      "[SHORT PERSONAL DESCRIPTION — how your head currently runs. One or two lines.]",
    /** The Spotify-Wrapped-style label for who you are. */
    personalityType: "THE CURIOUS COMPETITOR",
  },

  passions: {
    chapter: "DEVELOPMENT",
    title: "WHAT I DO WHEN NOBODY IS ASKING",
    subtitle: "Some things I play. Some things I read. Some things I just can't leave unfinished.",
    /** Label above the compact footer summary. */
    rotationLabel: "CURRENT ROTATION",
    /**
     * Six passions, equal weight. `visual` picks the card's motif — the valid
     * keys are "chess" | "football" | "sudoku" | "reading" | "building" | "cards".
     * `shortText` is the line on the card, `description` is the modal copy.
     * `detail` is OPTIONAL and deliberately unset: only add one when it's a real
     * fact (e.g. { label: "PLAYED SINCE", value: "2012" }) — never invent a stat.
     */
    items: [
      {
        id: "chess",
        title: "CHESS",
        shortLabel: "CHESS",
        visual: "chess",
        shortText: "I like games where the other person is actively trying to ruin my plan.",
        description:
          "I like games where the other person is actively trying to ruin my plan. Half the fun is that you can do everything right and still get outplayed — and the only thing to do about it is sit there and think harder.",
      },
      {
        id: "football",
        title: "FOOTBALL",
        shortLabel: "FOOTBALL",
        visual: "football",
        shortText:
          "I can happily spend an unreasonable amount of time watching a game where one goal changes everything.",
        description:
          "I can happily spend an unreasonable amount of time watching a game where one goal changes everything. Ninety minutes of almost nothing happening, and then it does, and everyone loses their minds. I've never really grown out of that.",
      },
      {
        id: "sudoku",
        title: "SUDOKU",
        shortLabel: "SUDOKU",
        visual: "sudoku",
        shortText:
          "There is something deeply satisfying about putting the last number in and knowing the grid has nowhere left to argue.",
        description:
          "There is something deeply satisfying about putting the last number in and knowing the grid has nowhere left to argue. No opinions, no negotiation — it either works or it doesn't. I find that genuinely relaxing.",
      },
      {
        id: "reading",
        title: "READING",
        shortLabel: "FICTION",
        visual: "reading",
        shortText:
          "I got back into fiction because sometimes I want a story that has absolutely nothing to do with what I need to get done.",
        description:
          "I got back into fiction because sometimes I want a story that has absolutely nothing to do with what I need to get done. Not to learn anything from it. Just to be somewhere else for a bit.",
      },
      {
        id: "building",
        title: "BUILDING THINGS",
        shortLabel: "BUILDING",
        visual: "building",
        shortText:
          "I enjoy taking something from “this should probably work” to “okay, it actually works.”",
        description:
          "I enjoy taking something from “this should probably work” to “okay, it actually works.” The messy middle part is annoying every single time, and I keep going back to it anyway.",
      },
      {
        id: "cardGames",
        title: "CARD GAMES",
        shortLabel: "CARD GAMES",
        visual: "cards",
        shortText:
          "I like games where the rules are simple, the stakes somehow become personal, and everyone suddenly becomes very competitive.",
        description:
          "I like games where the rules are simple, the stakes somehow become personal, and everyone suddenly becomes very competitive. Nothing is actually on the line, and somehow it still matters to everyone at the table.",
      },
    ] as {
      id: string;
      title: string;
      /** Short form used in the footer rotation strip. */
      shortLabel: string;
      visual: "chess" | "football" | "sudoku" | "reading" | "building" | "cards";
      shortText: string;
      description: string;
      detail?: { label: string; value: string };
    }[],
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
};

export type Content = typeof content;
