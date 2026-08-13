import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { content } from "@/content/cv";
import { Chessboard, EggCard } from "./Chessboard";
import { Counter } from "./Counter";
import { PhotoSlot } from "./PhotoSlot";
import { ChapterTag, Reveal, Section } from "./Reveal";
import { Loader, ProgressRail, SoundToggle } from "./Chrome";
import { playTick, setSoundEnabled } from "./sound";
import { useScrollProgress } from "./useReveal";

type Egg = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

const SECTION_IDS = [
  "player",
  "passions",
  "attack",
  "beauty",
  "loreal",
  "blunder",
  "wrapped",
  "endgame",
];

/** section id -> chapter index in content.chapters */
const SECTION_CHAPTER: Record<string, number> = {
  player: 0,
  passions: 1,
  attack: 2,
  beauty: 4,
  loreal: 4,
  blunder: 3,
  wrapped: 3,
  endgame: 5,
};

/** section id -> board stage */
const SECTION_STAGE: Record<string, number> = {
  player: 0,
  passions: 1,
  attack: 2,
  beauty: 4,
  loreal: 4,
  blunder: 3,
  wrapped: 4,
  endgame: 5,
};

export function Story() {
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [sound, setSound] = useState(false);
  const [egg, setEgg] = useState<Egg | null>(null);
  const [active, setActive] = useState("player");
  const progress = useScrollProgress();
  const storyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { threshold: [0.35, 0.6] },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [started]);

  const chapterIndex = SECTION_CHAPTER[active] ?? 0;
  const stage = SECTION_STAGE[active] ?? 0;

  const toggleSound = useCallback(() => {
    setSound((s) => {
      const next = !s;
      setSoundEnabled(next);
      if (next) playTick(440);
      return next;
    });
  }, []);

  const jumpToChapter = useCallback((i: number) => {
    const target = SECTION_IDS.find((id) => SECTION_CHAPTER[id] === i) ?? "player";
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const start = () => {
    setStarted(true);
    playTick(300);
    requestAnimationFrame(() => {
      setTimeout(() => document.getElementById("player")?.scrollIntoView({ behavior: "smooth" }), 60);
    });
  };

  const replay = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setStarted(false), 700);
  };

  return (
    <>
      <Loader done={loaded} />
      <SoundToggle on={sound} onToggle={toggleSound} />
      {started ? (
        <ProgressRail progress={progress} chapterIndex={chapterIndex} onJump={jumpToChapter} />
      ) : null}
      <EggCard eggKey={egg} onClose={() => setEgg(null)} />

      {!started ? (
        <Opening onStart={start} onEgg={setEgg} />
      ) : (
        <div ref={storyRef}>
          <FloatingBoard stage={stage} onEgg={setEgg} />
          <Player onEgg={setEgg} />
          <Passions />
          <Attack />
          <Beauty />
          <Loreal />
          <Blunder />
          <Wrapped />
          <Endgame onReplay={replay} onEgg={setEgg} />
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── OPENING SCREEN ─────────────────────────── */

function Opening({ onStart, onEgg }: { onStart: () => void; onEgg: (e: Egg) => void }) {
  const lines = [
    "EVERY GAME STARTS WITH A POSITION.",
    "So does every life.",
    "The interesting part is what you do with the next move.",
  ];
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-6 py-20">
      <div className="grain pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative flex flex-col items-center text-center">
        <Chessboard
          stage={0}
          size="min(70vmin, 26rem)"
          onEgg={onEgg}
          className="animate-scale-in"
        />
        <div className="mt-12 max-w-xl space-y-3">
          {lines.map((l, i) => (
            <p
              key={l}
              className={`animate-fade-in ${
                i === 0
                  ? "font-display text-2xl uppercase leading-tight sm:text-4xl"
                  : "text-sm text-muted-foreground sm:text-base"
              }`}
              style={{ animationDelay: `${600 + i * 700}ms`, animationFillMode: "backwards" }}
            >
              {l}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-12 animate-fade-in rounded-full bg-accent px-10 py-4 font-display text-lg uppercase tracking-wide text-accent-foreground transition-transform duration-300 hover:scale-105"
          style={{ animationDelay: "2600ms", animationFillMode: "backwards" }}
        >
          ▶ Start game
        </button>
        <p
          className="mt-8 animate-fade-in font-mono text-[0.6rem] tracking-[0.35em] text-muted-foreground"
          style={{ animationDelay: "3000ms", animationFillMode: "backwards" }}
        >
          {content.subtitle}
        </p>
        <p
          className="mt-3 animate-fade-in font-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground/60"
          style={{ animationDelay: "3200ms", animationFillMode: "backwards" }}
        >
          (pieces are clickable — some of them talk)
        </p>
      </div>
    </main>
  );
}

/* ─────────────────────────── PERSISTENT BOARD ─────────────────────────── */

function FloatingBoard({ stage, onEgg }: { stage: number; onEgg: (e: Egg) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-30 hidden xl:block">
      <div className="pointer-events-auto rounded-lg border border-border bg-card/70 p-3 backdrop-blur">
        <Chessboard stage={stage} size="11rem" onEgg={onEgg} />
        <p className="mt-2 text-center font-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
          POSITION AFTER MOVE {stage + 1}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── 01 THE PLAYER ─────────────────────────── */

function Player({ onEgg }: { onEgg: (e: Egg) => void }) {
  const c = content.intro;
  return (
    <Section id="player">
      <ChapterTag chapter={c.chapter} move="MOVE 01" />
      <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <Reveal>
            <h1 className="font-display text-[13vw] uppercase leading-[0.85] sm:text-7xl lg:text-8xl">
              {c.title}
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-5 max-w-md text-base text-muted-foreground">{c.subtitle}</p>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-8 max-w-xl border-l-2 border-accent pl-5 text-lg leading-relaxed">
              {c.voice}
            </p>
          </Reveal>

          <Reveal delay={300} className="mt-12">
            <h2 className="font-mono text-[0.65rem] tracking-[0.35em] text-accent">
              YOUR TOP TRAITS
            </h2>
            <ol className="mt-5 divide-y divide-border border-y border-border">
              {c.traits.map((t, i) => (
                <li
                  key={i}
                  className="group flex items-baseline gap-5 py-4 transition-colors hover:bg-secondary/50"
                >
                  <span className="font-display text-2xl text-muted-foreground transition-colors group-hover:text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl uppercase sm:text-2xl">{t}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal delay={150}>
            <PhotoSlot photo={c.portrait} />
          </Reveal>
          <Reveal delay={260}>
            <div className="hover-lift rounded-xl border border-border bg-card p-6">
              <div className="font-mono text-[0.6rem] tracking-[0.3em] text-accent">
                MOST LIKELY TO
              </div>
              <p className="mt-3 font-display text-2xl uppercase leading-tight">{c.mostLikelyTo}</p>
            </div>
          </Reveal>
          <Reveal delay={340}>
            <div className="hover-lift rounded-xl border border-border bg-cream p-6 text-cream-foreground">
              <div className="font-mono text-[0.6rem] tracking-[0.3em]">
                CURRENT OPERATING SYSTEM
              </div>
              <p className="mt-3 text-lg leading-snug">{c.operatingSystem}</p>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <button
              type="button"
              onClick={() => onEgg("knight")}
              className="font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground underline decoration-accent underline-offset-4 hover:text-foreground"
            >
              ♘ FIND THE KNIGHT
            </button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 02 PASSIONS ─────────────────────────── */

function Passions() {
  const c = content.passions;
  return (
    <Section id="passions">
      <ChapterTag chapter={c.chapter} move="MOVE 02" />
      <Reveal>
        <h2 className="max-w-4xl font-display text-[11vw] uppercase leading-[0.85] sm:text-6xl lg:text-7xl">
          {c.title}
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-4 font-mono text-[0.65rem] tracking-[0.3em] text-accent">{c.subtitle}</p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {c.cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 110}>
            <article className="hover-lift group flex h-full flex-col rounded-2xl border border-border bg-card p-7">
              <div className="flex items-start justify-between">
                <span className="text-4xl transition-transform duration-500 group-hover:-rotate-12">
                  {card.glyph}
                </span>
                <span className="font-mono text-[0.6rem] tracking-[0.3em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 font-display text-3xl uppercase">{card.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {card.text}
              </p>
              {card.minutes ? (
                <p className="mt-5 font-mono text-[0.6rem] tracking-[0.25em] text-accent">
                  <Counter to={card.minutes} /> MINUTES THIS YEAR
                </p>
              ) : null}
              {card.photo ? <PhotoSlot photo={card.photo} ratio="aspect-[16/10]" className="mt-6" /> : null}
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-3">
        {[
          { label: "YOUR MOST PLAYED", value: c.mostPlayed, tone: "accent" },
          { label: "YOUR MOST UNEXPECTED INTEREST", value: c.mostUnexpected, tone: "cream" },
          { label: "CURRENT OBSESSION", value: c.currentObsession, tone: "card" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 120}>
            <div
              className={`h-full rounded-2xl border border-border p-6 ${
                s.tone === "accent"
                  ? "bg-accent text-accent-foreground"
                  : s.tone === "cream"
                    ? "bg-cream text-cream-foreground"
                    : "bg-card"
              }`}
            >
              <div className="font-mono text-[0.6rem] tracking-[0.3em] opacity-70">{s.label}</div>
              <p className="mt-4 font-display text-3xl uppercase leading-[0.95]">{s.value}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─────────────────────────── 03 ATTACK ─────────────────────────── */

function Attack() {
  const c = content.competitive;
  const [val, setVal] = useState(c.scale);
  return (
    <Section id="attack">
      <ChapterTag chapter={c.chapter} move="MOVE 03" />
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <Reveal>
            <h2 className="font-display text-[15vw] uppercase leading-[0.82] sm:text-7xl lg:text-8xl">
              {c.title}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-4 text-base text-muted-foreground">{c.subtitle}</p>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 max-w-lg text-lg leading-relaxed">{c.text}</p>
          </Reveal>
        </div>

        <div>
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-8">
              <div className="font-mono text-[0.6rem] tracking-[0.3em] text-accent">WHY I COMPETE</div>
              <div className="mt-8 flex items-center justify-between font-display text-sm uppercase">
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
                className="mt-4 w-full accent-accent"
              />
              <p className="mt-4 text-center font-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
                {val}% GETTING BETTER · {100 - val}% WINNING
              </p>
            </div>
          </Reveal>

          <div className="mt-6 space-y-4">
            {c.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 110}>
                <div className="hover-lift flex flex-col gap-1 rounded-xl border border-border p-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="font-mono text-[0.6rem] tracking-[0.3em] text-muted-foreground">
                    {s.label}
                  </span>
                  <span className="font-display text-xl uppercase sm:text-right">{s.value}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 04 BEAUTY ─────────────────────────── */

function Beauty() {
  const c = content.beauty;
  return (
    <Section id="beauty" className="bg-cream text-cream-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="float-slow absolute -right-24 top-16 h-72 w-72 rounded-full border border-cream-foreground/15" />
        <div className="float-slow absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-cream-foreground/[0.04]" />
      </div>
      <div className="relative">
        <Reveal className="mb-8 flex items-center gap-4">
          <span className="h-px w-10 bg-cream-foreground/40" />
          <span className="font-mono text-[0.65rem] tracking-[0.35em]">{c.chapter}</span>
          <span className="font-mono text-[0.65rem] tracking-[0.35em] opacity-50">MOVE 04</span>
        </Reveal>

        <Reveal>
          <h2 className="max-w-4xl font-display text-[12vw] uppercase leading-[0.85] sm:text-6xl lg:text-7xl">
            {c.title}
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <div className="border-l-2 border-cream-foreground/30 pl-6">
              <div className="font-mono text-[0.65rem] tracking-[0.3em] opacity-60">
                I USED TO THINK…
              </div>
              <p className="mt-4 text-xl leading-relaxed">{c.used_to_think}</p>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="border-l-2 border-cream-foreground pl-6">
              <div className="font-mono text-[0.65rem] tracking-[0.3em]">NOW I THINK…</div>
              <p className="mt-4 text-xl leading-relaxed">{c.now_think}</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 space-y-px border-y border-cream-foreground/20">
          {c.definitions.map((d, i) => (
            <Reveal key={i} delay={i * 130}>
              <div className="group grid gap-4 border-b border-cream-foreground/10 py-10 last:border-0 md:grid-cols-[auto_1fr] md:gap-12">
                <h3 className="font-display text-3xl uppercase leading-none md:text-4xl">
                  <span className="opacity-40">BEAUTY =</span>{" "}
                  <span className="transition-all group-hover:tracking-wide">{d.concept}</span>
                </h3>
                <p className="max-w-2xl text-base leading-relaxed opacity-80">{d.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-16 max-w-sm">
          <PhotoSlot photo={c.memory} ratio="aspect-[3/2]" />
        </Reveal>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 05 L'ORÉAL MATCH ─────────────────────────── */

function Loreal() {
  const c = content.loreal;
  return (
    <Section id="loreal">
      <Reveal className="mb-6">
        <span className="font-mono text-[0.65rem] tracking-[0.35em] text-accent">
          BRAND MATCH · MOVE 05
        </span>
      </Reveal>
      <Reveal>
        <h2 className="max-w-3xl font-display text-[11vw] uppercase leading-[0.85] sm:text-6xl">
          {c.title}
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <div className="mt-10 overflow-hidden rounded-3xl border border-accent/40 bg-card p-10 text-center">
          <div className="font-mono text-[0.6rem] tracking-[0.35em] text-muted-foreground">
            THE MATCH IS
          </div>
          <p className="mt-4 font-display text-[14vw] uppercase leading-[0.85] text-accent sm:text-7xl">
            {c.brand}
          </p>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground">{c.brandLine}</p>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {c.reasons.map((r, i) => (
          <Reveal key={r.label} delay={i * 120}>
            <div className="hover-lift h-full rounded-2xl border border-border bg-card p-7">
              <div className="font-display text-5xl text-accent/25">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-4 font-mono text-[0.6rem] tracking-[0.3em] text-accent">
                {r.label}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={160}>
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8">
          <div className="font-display text-2xl uppercase sm:text-3xl">
            BUT WE&apos;RE NOT IDENTICAL.
          </div>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {c.notIdentical}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

/* ─────────────────────────── 06 THE BLUNDER ─────────────────────────── */

function Blunder() {
  const c = content.blunder;
  return (
    <Section id="blunder">
      <ChapterTag chapter={c.chapter} move="MOVE 06" />
      <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <Reveal>
            <h2 className="max-w-3xl font-display text-[12vw] uppercase leading-[0.85] sm:text-6xl lg:text-7xl">
              {c.title}
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="mt-10 font-mono text-[0.65rem] tracking-[0.35em] text-destructive">
              {c.headline}
            </div>
            <p className="mt-3 font-display text-3xl uppercase leading-tight sm:text-4xl">
              {c.name}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border sm:grid-cols-2">
            {c.rows.map((r, i) => (
              <Reveal key={r.label} delay={i * 110}>
                <div className="h-full border-b border-r border-border bg-card p-7">
                  <div className="font-mono text-[0.6rem] tracking-[0.3em] text-accent">
                    {r.label}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={200}>
          <div className="mx-auto grid w-40 place-items-center">
            <span className="shake-piece text-8xl text-destructive">♞</span>
            <p className="mt-6 text-center font-mono text-[0.55rem] tracking-[0.3em] text-muted-foreground">
              PIECE HANGING
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="mt-14 rounded-2xl border border-border bg-secondary p-8">
          <div className="font-mono text-[0.6rem] tracking-[0.3em] text-muted-foreground">
            SECONDARY BLUNDER
          </div>
          <h3 className="mt-3 font-display text-2xl uppercase sm:text-3xl">{c.second.name}</h3>
          <p className="mt-4 max-w-2xl text-base leading-relaxed">{c.second.text}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {c.second.reflection}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            {["PHOTO — MISSING", "PHOTO — MISSING", "PHOTO — MISSING"].map((l, i) => (
              <div
                key={i}
                className="grain grid aspect-square place-items-center rounded-lg border border-dashed border-border text-center font-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground"
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ─────────────────────────── 07 WRAPPED ─────────────────────────── */

function Wrapped() {
  const c = content.wrapped;
  const marquee = useMemo(
    () => Array(2).fill(`${content.name} WRAPPED · ${content.year} · `).join("").repeat(4),
    [],
  );
  return (
    <Section id="wrapped" className="overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-10 select-none opacity-[0.07]" aria-hidden>
        <div className="marquee whitespace-nowrap font-display text-7xl uppercase">{marquee}</div>
      </div>

      <div className="relative">
        <Reveal>
          <h2 className="font-display text-[14vw] uppercase leading-[0.82] text-accent sm:text-7xl lg:text-8xl">
            {c.title}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-4 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground">
            {c.subtitle}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.cards.map((card, i) => (
            <Reveal key={card.label} delay={i * 90}>
              <div
                className={`hover-lift flex h-full min-h-[11rem] flex-col justify-between rounded-2xl border border-border p-6 ${
                  i % 5 === 0
                    ? "bg-accent text-accent-foreground"
                    : i % 3 === 0
                      ? "bg-cream text-cream-foreground"
                      : "bg-card"
                }`}
              >
                <div className="font-mono text-[0.6rem] tracking-[0.3em] opacity-70">
                  {card.label}
                </div>
                <p className="mt-6 font-display text-3xl uppercase leading-[0.95]">{card.value}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 border-y border-border py-10 sm:grid-cols-3">
          {c.numbers.map((n, i) => (
            <Reveal key={n.label} delay={i * 120} className="text-center">
              <div className="font-display text-5xl leading-none text-accent sm:text-6xl">
                <Counter to={n.value} suffix={n.suffix} />
              </div>
              <div className="mt-3 font-mono text-[0.55rem] tracking-[0.3em] text-muted-foreground">
                {n.label}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={140}>
          <div className="mt-12 text-center">
            <div className="font-mono text-[0.6rem] tracking-[0.35em] text-muted-foreground">
              CURRENT MOOD
            </div>
            <p className="mt-4 font-display text-[13vw] uppercase leading-[0.85] sm:text-6xl">
              &ldquo;{c.mood}&rdquo;
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ─────────────────────────── 08 THE NEXT MOVE ─────────────────────────── */

function Endgame({ onReplay, onEgg }: { onReplay: () => void; onEgg: (e: Egg) => void }) {
  const c = content.endgame;
  return (
    <Section id="endgame">
      <ChapterTag chapter={c.chapter} move="MOVE 08" />
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <Chessboard stage={5} size="min(70vmin, 24rem)" onEgg={onEgg} />
          <p className="mt-4 font-mono text-[0.55rem] tracking-[0.3em] text-muted-foreground">
            SAME BOARD. DIFFERENT POSITION.
          </p>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="font-display text-[15vw] uppercase leading-[0.82] sm:text-7xl">
              {c.title}
            </h2>
          </Reveal>
          <div className="mt-8 space-y-2">
            {c.lines.map((l, i) => (
              <Reveal key={l} delay={i * 130}>
                <p className="font-display text-xl uppercase text-muted-foreground sm:text-2xl">
                  {l}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-12 rounded-2xl border border-border bg-card p-7">
              <div className="font-mono text-[0.6rem] tracking-[0.3em] text-accent">GAME STATUS</div>
              <dl className="mt-5 divide-y divide-border">
                {c.status.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="font-mono text-[0.7rem] tracking-[0.2em] text-muted-foreground">
                      {s.label.toUpperCase()}
                    </dt>
                    <dd className="font-display text-lg uppercase">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mt-24 text-center">
        {c.final.map((l, i) => (
          <Reveal key={l} delay={i * 200}>
            <p className="mx-auto max-w-2xl font-display text-2xl uppercase leading-tight sm:text-4xl">
              {l}
            </p>
          </Reveal>
        ))}
        <Reveal delay={400}>
          <p className="mt-14 font-mono text-[0.7rem] tracking-[0.4em] text-accent">{c.signoff}</p>
        </Reveal>
        <Reveal delay={500}>
          <button
            type="button"
            onClick={onReplay}
            className="mt-10 rounded-full border border-border px-8 py-3 font-mono text-[0.65rem] tracking-[0.3em] text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
          >
            ↻ PLAY AGAIN
          </button>
        </Reveal>
        <p className="mt-16 font-mono text-[0.55rem] tracking-[0.3em] text-muted-foreground/60">
          {content.subtitle}
        </p>
      </div>
    </Section>
  );
}
