/*
 * The nine shots, one idea each. Every cue is a spoken word from
 * timeline.json; entrances are a short rise with a fade (and blur-to-sharp on
 * the serif), exits a quiet fade timed into the pauses.
 */
import type { CSSProperties, ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { BookButton, Wordmark } from "../components/Brand";
import { CoralField } from "../components/CoralField";
import { Reveal, useExit } from "../components/Reveal";
import { beats } from "../lib/beats";
import { type Layout, colours, easeInOut, fonts } from "../lib/theme";
import { FPS, LEAD, frames, line, word } from "../lib/timeline";

type SceneProps = { layout: Layout };

const serif = (size: number, colour: string = colours.sand): CSSProperties => ({
  fontFamily: fonts.serif,
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing: "-0.025em",
  color: colour,
  whiteSpace: "nowrap",
});

/** A full-width row whose centre sits at `y`. */
function Row({ y, layout, children, style }: { y: number; layout: Layout; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        left: layout.side,
        right: layout.side,
        top: y,
        transform: "translateY(-50%)",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* 1. "starts small." over drifting particles. */
export function StartsSmall({ layout }: SceneProps) {
  const { cy, ts } = layout;
  const out = line(2).start - 0.05;
  const size = 250 * ts;
  return (
    <>
      <Row y={cy - size * 0.5} layout={layout} style={serif(size)}>
        <Reveal at={word(1, "starts").start} blur={10} out={out}>
          starts
        </Reveal>
      </Row>
      <Row y={cy + size * 0.5} layout={layout} style={serif(size, colours.coral)}>
        <Reveal at={word(1, "small").start} blur={10} out={out}>
          small.
        </Reveal>
      </Row>
    </>
  );
}

/* 2. Typed, stacked Geist Mono, with a cursor after the last line. */
const CHARS_PER_SECOND = 24;
export function LoopSprite({ layout }: SceneProps) {
  const frame = useCurrentFrame();
  const { cy, ts } = layout;
  const size = 124 * ts;
  const step = FPS / CHARS_PER_SECOND;
  const third = word(2, "one").start;
  const rows = [
    { text: "A loop.", at: word(2, "a", 0).start },
    { text: "A sprite.", at: word(2, "a", 1).start },
    { text: "One line", at: third },
    // Typed straight on from "One line".
    { text: "of code.", at: third + ("One line".length * step) / FPS + 0.08 },
  ];
  const typed = rows.map((r) => Math.max(0, Math.min(r.text.length, Math.floor((frame - (frames(r.at) - LEAD)) / step) + 1)));
  const active = typed.reduce((last, n, i) => (n > 0 ? i : last), -1);
  const lastDone = frames(rows[3].at) - LEAD + Math.ceil(rows[3].text.length * step);
  const blinkOn = frame < lastDone || Math.floor((frame - lastDone) / 15) % 2 === 0;
  const q = useExit(line(3).start - 0.1, 0.4);
  const width = Math.max(...rows.map((r) => r.text.length));
  const lineHeight = 1.2;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: cy,
        width: `${width}ch`,
        transform: "translate(-50%, -50%)",
        fontFamily: fonts.mono,
        fontSize: size,
        lineHeight,
        color: colours.sand,
        letterSpacing: 0,
        opacity: 1 - q,
        whiteSpace: "pre",
      }}
    >
      {rows.map((r, i) => (
        <div key={i} style={{ height: `${lineHeight}em` }}>
          {r.text.slice(0, typed[i])}
          {i === active && blinkOn ? (
            <span
              style={{
                display: "inline-block",
                width: "0.1em",
                height: "0.95em",
                marginLeft: "0.06em",
                verticalAlign: "-0.14em",
                background: colours.sand,
              }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* 3. "it grows." small beneath the assembling coral. */
export function ItGrows({ layout }: SceneProps) {
  return (
    <Row y={layout.coral.baseY + 95 * layout.vs} layout={layout} style={serif(84 * layout.ts)}>
      <Reveal at={word(3, "it").start} dur={0.8} blur={6} out={line(4).start - 0.1} outDur={0.45}>
        it grows.
      </Reveal>
    </Row>
  );
}

/* 4. The wordmark resolves over the settled, dimmed coral. */
export function Wordmark4({ layout }: SceneProps) {
  return (
    <Row y={layout.cy} layout={layout}>
      <Reveal at={word(4, "Coral").start} dur={0.8} rise={16} blur={12} out={beats.toSand.from + 0.15} outDur={0.4}>
        <Wordmark height={112 * layout.ts} />
      </Reveal>
    </Row>
  );
}

/* 5. Ages in a calm diagonal; each course name lands on its spoken word, the age on its number. */
export function Ages({ layout }: SceneProps) {
  const { cy, vs, ts, width } = layout;
  const q = useExit(line(6).start + 0.25, 0.45);
  const items = [
    { age: "6+", name: "Scratch", nameAt: word(5, "Scratch").start, ageAt: word(5, "6").start },
    { age: "9+", name: "Python", nameAt: word(5, "Python").start, ageAt: word(5, "9").start },
    { age: "12+", name: "AI", nameAt: word(5, "AI").start, ageAt: word(5, "12").start },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - q, transform: `translateX(${-90 * easeInOut(q)}px)` }}>
      {items.map((item, i) => {
        const x = width / 2 + (i - 1) * 265;
        const y = cy + (i - 1) * 330 * vs;
        return (
          <div key={item.age} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <Reveal at={item.ageAt} blur={10} inline={false} style={serif(240 * ts, colours.coralDeep)}>
              {item.age}
            </Reveal>
            <Reveal
              at={item.nameAt}
              inline={false}
              rise={12}
              style={{ fontFamily: fonts.sans, fontWeight: 500, fontSize: 44 * ts, color: colours.ink, marginTop: 14 * ts }}
            >
              {item.name}
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}

/* 6. "Python. SQL. AI." word by word in ink serif. */
export function Adults({ layout }: SceneProps) {
  const { cy, vs, ts } = layout;
  const out = line(7).start - 0.1;
  const rows = [
    { text: "Python.", at: word(6, "Python").start },
    { text: "SQL.", at: word(6, "SQL").start },
    { text: "AI.", at: word(6, "AI").start },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <Row key={r.text} y={cy + (i - 1) * 235 * vs} layout={layout} style={serif(215 * ts, colours.ink)}>
          <Reveal at={r.at} blur={10} out={out} outDur={0.4}>
            {r.text}
          </Reveal>
        </Row>
      ))}
    </>
  );
}

/* 7. The whole line as big type, word by word, with "AI" as the one coloured word. */
export function TaughtBy({ layout }: SceneProps) {
  const { cy, ts } = layout;
  const size = 120 * ts;
  const out = beats.toInk.from + 0.1;
  return (
    <WordRows
      layout={layout}
      line={7}
      size={size}
      top={cy - 2 * size}
      colour={colours.ink}
      accent={colours.coralDeep}
      out={out}
      rows={[
        [{ cue: "All" }, { cue: "taught" }, { cue: "by" }],
        [{ cue: "a" }, { cue: "software" }, { cue: "engineer" }],
        [{ cue: "who" }, { cue: "builds" }, { cue: "with" }, { cue: "AI", accent: true }],
        [{ cue: "every" }, { cue: "day" }],
      ]}
    />
  );
}

/**
 * Big serif rows whose words each land on their own spoken word. Text comes
 * from timeline.json (so it matches the voice); `accent` marks the one
 * coloured word.
 */
function WordRows({
  layout,
  line: n,
  rows,
  size,
  top,
  colour,
  accent,
  out,
}: {
  layout: Layout;
  line: number;
  rows: { cue: string; accent?: boolean }[][];
  size: number;
  top: number;
  colour: string;
  accent: string;
  out: number;
}) {
  return (
    <>
      {rows.map((row, r) => (
        <Row key={r} y={top + (r + 0.5) * size} layout={layout} style={serif(size, colour)}>
          {row.map((w, i) => {
            const spoken = word(n, w.cue);
            return (
              <span key={w.cue}>
                <Reveal at={spoken.start} blur={10} out={out} outDur={0.4} style={w.accent ? { color: accent } : undefined}>
                  {spoken.text}
                </Reveal>
                {i < row.length - 1 ? " " : ""}
              </span>
            );
          })}
        </Row>
      ))}
    </>
  );
}

/* 8. "Your first lesson is absolutely free." with the real button, pressed just after "free". */
export function FirstLessonFree({ layout }: SceneProps) {
  const { cy, ts } = layout;
  const size = 168 * ts;
  const out = line(9).start - 0.1;
  const rows: { text: string; cue: string; coral?: boolean }[][] = [
    [
      { text: "Your", cue: "your" },
      { text: "first", cue: "first" },
    ],
    [
      { text: "lesson", cue: "lesson" },
      { text: "is", cue: "is" },
    ],
    [{ text: "absolutely", cue: "absolutely" }],
    [{ text: "free.", cue: "free", coral: true }],
  ];
  const blockTop = cy - 2 * size - 70 * ts;
  return (
    <>
      {rows.map((row, r) => (
        <Row key={r} y={blockTop + (r + 0.5) * size} layout={layout} style={serif(size)}>
          {row.map((w, i) => (
            <span key={w.text}>
              <Reveal at={word(8, w.cue).start} blur={10} out={out} outDur={0.4} style={w.coral ? { color: colours.coral } : undefined}>
                {w.text}
              </Reveal>
              {i < row.length - 1 ? " " : ""}
            </span>
          ))}
        </Row>
      ))}
      <Row y={blockTop + 4 * size + 120 * ts} layout={layout}>
        <Reveal at={word(8, "absolutely").start} rise={14} out={out} outDur={0.4}>
          <BookButton pressAt={beats.press} scale={2.5 * ts} />
        </Reveal>
      </Row>
    </>
  );
}

/* 9. End card: the coral returns small and glowing, the wordmark, the address. Holds still. */
export function EndCard({ layout }: SceneProps) {
  const { ts, endCoral } = layout;
  const base = endCoral.baseY;
  const small = 66 * ts;
  return (
    <>
      <CoralField layout={layout} mode="end" glow={18} />
      <CoralField layout={layout} mode="end" />
      <Row y={base + 105 * ts} layout={layout}>
        <Reveal at={line(9).start - 0.05} dur={0.8} rise={14} blur={10}>
          <Wordmark height={76 * ts} />
        </Reveal>
      </Row>
      <Row y={base + 265 * ts} layout={layout} style={serif(small, colours.mistOnInk)}>
        <Reveal at={word(9, "Visit").start} blur={8}>
          Visit
        </Reveal>
      </Row>
      <Row y={base + 375 * ts} layout={layout} style={serif(128 * ts, colours.coral)}>
        <Reveal at={word(9, "coralcoders.com").start} blur={10}>
          coralcoders.com
        </Reveal>
      </Row>
      <Row y={base + 485 * ts} layout={layout} style={serif(small, colours.mistOnInk)}>
        <Reveal at={word(9, "today").start} blur={8}>
          today to sign up.
        </Reveal>
      </Row>
    </>
  );
}
