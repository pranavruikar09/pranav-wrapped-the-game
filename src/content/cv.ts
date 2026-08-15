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

/** One Wrapped-style card. `kind` picks which small visual renders inside it. */
export type WrappedCard =
  | { kind: "music"; label: string; song: string; artist: string; caption: string }
  | {
      kind: "match";
      label: string;
      teamA: string;
      teamB: string;
      round: string;
      score: string;
      caption: string;
    }
  | { kind: "thought"; label: string; text: string; caption: string }
  | { kind: "mistake"; label: string; text: string; caption: string }
  | { kind: "twist"; label: string; from: string; to: string; caption: string }
  | { kind: "experience"; label: string; title: string; caption: string; photo: Photo };

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
    portrait: { label: "ME", src: "/Photos/Raigad.jpeg", caption: "" } as Photo,
    /** Three small personal photos for the journey page. Add real files under /public and set `src`. */
    photos: [
      { label: "PHOTO — SMALL-TOWN ROOTS", src: "/Photos/Village.jpeg", caption: "MY VILLAGE" },
      { label: "PHOTO — HOSTEL LIFE", src: "/Photos/Hostel.jpeg", caption: "HOSTEL LIFE" },
      { label: "PHOTO — A NEW CHAPTER", src: "/Photos/IIM_Mumbai_cropped.jpg", caption: "A NEW CHAPTER" },
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
        text: "I've lived in a village, a hostel, a small town, a bigger city and now Mumbai. Every move meant getting used to people and ways of doing things that weren't mine. I learned to adapt before I learned to have an opinion.",
      },
      {
        trait: "SELF-RELIANT",
        text: "Living away from home from the age of four probably had something to do with this. I've gotten used to handling things myself — although I still occasionally call home when I can't figure something out.",
      },
      {
        trait: "CURIOUS",
        text: "I ask a lot of questions. Some are useful, some are unnecessary, and some somehow turn into a 20-minute rabbit hole. I haven't decided which category I prefer.",
      },
      {
        trait: "RESILIENT",
        text: "JEE didn't work out. Neither did my first CAT attempt. Neither felt particularly great at the time. But I've become fairly comfortable with things not going according to plan and trying again.",
      },
    ],
    mostLikelyTo: "[PERSONAL QUIRK — the thing your friends would bet money on you doing]",
    operatingSystem:
      "[SHORT PERSONAL DESCRIPTION — how your head currently runs. One or two lines.]",
    /** The Spotify-Wrapped-style label for who you are. */
    personalityType: "The JUST IN CASE PACKER",
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
          "There is something deeply satisfying about putting the last number in and knowing the grid has nowhere left to argue. No opinions, no negotiation - it either works or it doesn't. I find that genuinely relaxing.",
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
    /**
     * A small photo strip, independent of the passion cards above — a
     * separate sibling section, not one photo per card. Four snapshots, not
     * one per passion.
     */
    gallery: [
      { label: "FOOTBALL", src: "/Photos/Football.jpeg" },
      { label: "CHESS", src: "/Photos/Chess.jpeg" },
      { label: "DRONE", src: "/Photos/Drone.jpeg" },
      { label: "ROBOCON", src: "/Photos/Robocon.jpeg" },
    ] as Photo[],
  },

  /**
   * Beauty begins at home: three people, one quality each. Not a corporate
   * beauty-brand page — this is personal. `label` is the small eyebrow above
   * the hero heading; the heading itself and the closing statement are
   * hardcoded in Story.tsx (their accent words are styled per-word, same
   * pattern as every other big headline in this file).
   */
  beauty: {
    chapter: "SACRIFICE",
    label: "WHAT BEAUTY MEANS TO ME",
    subtitle: "The first people who shaped me. The reasons I believe in who I am.",
    mother: {
      relation: "MY MOTHER",
      trait: "COURAGE",
      quote:
        "She has faced every challenge with a quiet strength that never needed an audience. Her courage is what I think of whenever things feel uncertain.",
      photo: { label: "PHOTO — MOTHER", src: "" } as Photo,
    },
    father: {
      relation: "MY FATHER",
      trait: "INTEGRITY",
      quote:
        "He taught me that doing the right thing matters even when nobody is watching. His integrity is one of the standards I try to carry with me.",
      photo: { label: "PHOTO — FATHER", src: "" } as Photo,
    },
    brother: {
      relation: "MY BROTHER",
      trait: "HELPING NATURE",
      quote:
        "He's the first to show up when someone needs help, without ever making a big deal out of it. His instinct to help is something I genuinely admire.",
      photo: { label: "PHOTO — BROTHER", src: "" } as Photo,
    },
  },

  /**
   * The L'Oréal brand match, framed as a Spotify-Wrapped result rather than
   * an ad for the brand. `traits` are exactly 3 — clickable rows that expand
   * into the same centered analysis card used on the Brilliancies & Blunders
   * page, reusing that component rather than a new modal system.
   */
  loreal: {
    brand: "CERAVE",
    brandLine: "QUIETLY RELIABLE — LESS TALK, MORE SUBSTANCE.",
    traits: [
      {
        title: "SCIENCE OVER NOISE",
        text: "I like understanding how things work. I tend to trust evidence, logic and first principles more than just having the loudest opinion.",
        icon: "flask",
        image: "/Photos/Cerave1.jpeg",
      },
      {
        title: "RELIABILITY OVER RECOGNITION",
        text: "I value consistency and integrity. I'd rather be someone people can rely on than someone who constantly has to prove that I am.",
        icon: "shield",
        image: "/Photos/Cerave2.jpeg",
      },
      {
        title: "SIMPLE OUTSIDE. THOUGHTFUL INSIDE.",
        text: "I like keeping things uncomplicated on the surface, while putting real thought into what sits underneath.",
        icon: "puzzle",
        image: "/Photos/Cerave3.jpeg",
      },
    ] as { title: string; text: string; icon: "flask" | "shield" | "puzzle"; image: string }[],
    /** One small Wrapped-style stat — kept to a single data point on purpose. */
    stat: { label: "NO-NONSENSE INDEX", value: "98%" },
    moveCaption: "NO FLASHY MOVES. JUST THE RIGHT ONES.",
  },

  /**
   * Strengths and weaknesses, told through the chess metaphor rather than a
   * competency slide. `brilliancies` = the good moves, `blunders` = the ones
   * still being learned from. Both arrays are exactly 3 items, rendered as
   * clickable rows that expand into a centered analysis card on click. The
   * hero heading and subtitle are hardcoded in Story.tsx (same pattern as
   * every other big per-word-accented headline in this file).
   */
  blunder: {
    brilliancies: [
      {
        title: "FINDING THE THREAD",
        text: "When things aren't clear, I look for the problem underneath the noise and find a direction forward.",
        icon: "search",
      },
      {
        title: "PLAYING THE ENDGAME",
        text: "I like knowing where I'm trying to get before deciding which moves will take me there.",
        icon: "target",
      },
      {
        title: "KEEPING THE CLOCK RUNNING",
        text: "Once I lock in the direction, I bring the energy and persistence to keep moving forward.",
        icon: "bolt",
      },
    ] as { title: string; text: string; icon: "search" | "target" | "bolt" }[],
    blunders: [
      {
        title: "THINK LESS. MOVE MORE.",
        text: "I can spend too much time analysing a simple move when making it and adjusting later would be better.",
        icon: "thought",
      },
      {
        title: "ZOOM OUT",
        text: "When something grabs my attention, I can go deep enough to forget to look around.",
        note: "Working on my wide angle.",
        icon: "eye",
      },
      {
        title: "ONE. MORE. GAME.",
        text: "I've been telling myself this for years.",
        note: "Is it really a weakness if I'm still winning?",
        badge: "SELF-AWARENESS: +1",
        icon: "king",
      },
    ] as { title: string; text: string; note?: string; badge?: string; icon: "thought" | "eye" | "king" }[],
  },

  wrapped: {
    title: "PRANAV WRAPPED",
    subtitle: "A YEAR. A FEW MOVES. A LOT OF RANDOM THINGS.",
    eyebrow: "YOUR YEAR IN REVIEW",
    cards: [
      {
        kind: "music",
        label: "MOST PLAYED",
        song: "UP&UP",
        artist: "COLDPLAY",
        caption: "The song I kept coming back to. Apparently, I needed the reminder.",
      },
      {
        kind: "match",
        label: "MOST WATCHED",
        teamA: "BAYERN MUNICH",
        teamB: "REAL MADRID",
        round: "2ND LEG",
        score: "4 — 3",
        caption: "Some matches are watched. Some are experienced.",
      },
      {
        kind: "thought",
        label: "MOST REPEATED THOUGHT",
        text: "WHICH GEAR AM I ON?",
        caption:
          "New driver problems. Somehow this question needed answering approximately 47 times.",
      },
      {
        kind: "mistake",
        label: "MOST REPEATED MISTAKE",
        text: "STARTING THE CAR WITH THE HANDBRAKE ON.",
        caption: "Apparently the car wasn't the only thing learning.",
      },
      {
        kind: "twist",
        label: "BIGGEST PLOT TWIST",
        from: "ME",
        to: "IIM MUMBAI",
        caption: "Not exactly how I pictured the route. Somehow, the route worked.",
      },
      {
        kind: "experience",
        label: "MOST UNDERRATED EXPERIENCE",
        title: "A TREK TO KALUSUBAI PEAK",
        caption: "No deadlines. No notifications. Just a very long climb and a much better view.",
        photo: { label: "PHOTO — KALUSUBAI PEAK", src: "/Photos/Trek.jpeg" } as Photo,
      },
    ] as WrappedCard[],
    final: {
      label: "CURRENT STATUS",
      lines: ["SPENT YEARS TRYING TO MAKE THE RIGHT MOVES.", "STILL GET CHECKED BY LIFE."],
      tag: "GAME ON.",
    },
    outro: {
      thanks: "THANKS FOR PLAYING.",
      line: "STILL MAKING MOVES.",
    },
  },

  endgame: {
    chapter: "ENDGAME",
    /** Sentence case on purpose — rendered without the uppercase treatment
     *  the rest of the site uses, matching the reference's reflective tone. */
    lines: [
      "25 years in.",
      "A few good moves. A few questionable ones.",
      "Still figuring out the position.",
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
