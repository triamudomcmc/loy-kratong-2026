"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Cloud, Layer, Logo, MovingMoon, NavHeader, Stage, TealSky, u, type MoonPose } from "@components/ui";
import { Kratong } from "@components/Kratong/kratong";
import type { AnyResultData } from "@types-app/kratong";
import { useContinue } from "./use-continue";

const A = "/assets/figma-v2/scenery";
const CAPTION = "โอมเพี้ยง !";

/** The moon of Scene 22 (Figma 203:2258). */
const POSE: MoonPose = { glow: { x: 219, y: 63, size: 129 }, body: { x: 219, y: 63, size: 131 } };

/** Timeline (seconds). The candle catches at LIGHT; the shade lifts right after. */
const TEXT_AT = 0.45;
const LIGHT_AT = 1.6;

/** The kratong stands on the water: centre x, base bottom y, width (design px, frame 375 x 812). */
const CX = 187.5;
const BOTTOM = 655;
const SIZE = 262;
const H = (SIZE * 2400) / 2048;
const TOP = BOTTOM - H;
/** Where the flame sits in the kratong box (fraction of its height from the top). */
const FLAME_Y = 0.5;

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** Water strips are mirrored sideways past the frame so they never end inside a wide viewport. */
function Strip({ x, y, w, h, src }: { x: number; y: number; w: number; h: number; src: string }) {
  return (
    <>
      {[-2, -1, 0, 1, 2].map((k) => (
        <Layer key={k} x={x + k * w} y={y} w={w} h={h} style={{ transform: k % 2 ? "scaleX(-1)" : undefined }}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={src} />
        </Layer>
      ))}
    </>
  );
}

/** Scene 22's water (three layers) with the three small clouds above it, no sala, no floor. */
function Water() {
  return (
    <>
      <Strip x={-297} y={563} w={930} h={222} src={`${A}/water-top.svg`} />
      <Strip x={-329} y={573} w={930} h={226} src={`${A}/water-mid.svg`} />
      <Strip x={-375} y={585} w={930} h={226} src={`${A}/water-bottom.svg`} />
    </>
  );
}

function Clouds() {
  const c = (x: number, y: number, w: number, h: number, dur: number, delay: number) => (
    <Cloud name="cloud-small" src={`${A}/cloud-small.svg`} x={x} y={y} w={w} h={h} opacity={0.13} drift={8} driftDuration={dur} driftDelay={-delay} />
  );
  return (
    <>
      {c(-35, 124, 146.8, 99, 16, 0)}
      {c(266, 85, 155, 109, 19, 4)}
      {c(56, 77, 120, 83, 14, 7)}
      {c(168, 139, 92, 64, 17, 2)}
      {/* extra clouds so wide screens stay filled */}
      {c(-330, 100, 150, 101, 18, 5)}
      {c(470, 150, 140, 94, 20, 9)}
      {c(-190, 190, 110, 76, 15, 3)}
      {c(610, 70, 120, 83, 17, 6)}
    </>
  );
}

/** Ripples and shadow under the kratong (Scene 22's ripple / shadow art), pulsing slowly. */
function Ripples({ reduce }: { reduce: boolean | null }) {
  const ring = (w: number, delay: number) => (
    <motion.div
      className="absolute"
      style={{ left: u(CX - w / 2 + w * 0.1), top: u(BOTTOM - w * 0.0553 - 4), width: u(w), height: u(w * 0.1106) }}
      animate={reduce ? undefined : { scaleX: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/ripple-left.svg`} />
    </motion.div>
  );
  return (
    <>
      {ring(330, 0)}
      {ring(220, 1.4)}
      <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "multiply" }}>
        <Layer x={CX - 85} y={BOTTOM - 26} w={170} h={54} style={{ transform: "rotate(180deg)" }}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/shadow-left.svg`} />
        </Layer>
      </div>
    </>
  );
}

/** A few warm embers rising from the flame once it catches. */
const EMBERS = [
  { dx: -10, rise: 78, size: 4, delay: 0.1, dur: 2.6 },
  { dx: 9, rise: 96, size: 3, delay: 0.9, dur: 3.1 },
  { dx: 2, rise: 64, size: 3, delay: 1.7, dur: 2.4 },
];

function Embers() {
  return (
    <>
      {EMBERS.map((e, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: u(CX + e.dx),
            top: u(TOP + H * FLAME_Y),
            width: u(e.size),
            height: u(e.size),
            background: "#ffd98a",
            boxShadow: "0 0 8px 2px rgba(255,186,90,.8)",
            zIndex: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, `calc(var(--u) * -${e.rise})`], x: [0, `calc(var(--u) * ${e.dx * 0.6})`] }}
          transition={{ duration: e.dur, delay: LIGHT_AT + 0.2 + e.delay, repeat: Infinity, repeatDelay: 1.2, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

const textGlow = (a: number) =>
  `drop-shadow(0 0 ${6 * a}px rgba(255,255,255,${0.9 * a})) drop-shadow(0 0 ${22 * a}px rgba(255,255,255,${0.55 * a}))`;

/** One headline line: hidden at first, glows in (bright white + soft glow + small rise), then settles to a gentle glow. */
function GlowLine({
  y,
  fontSize,
  reduce,
  lines = 1,
  children,
}: {
  y: number;
  fontSize: number;
  reduce: boolean | null;
  /** >1: wrap onto up to this many lines, ending in an ellipsis (the wish) */
  lines?: number;
  children: string;
}) {
  const style: CSSProperties = {
    position: "absolute",
    left: u(187.5),
    top: u(y),
    width: u(320),
    marginLeft: u(-160),
    fontSize: u(fontSize),
    lineHeight: lines > 1 ? 1.35 : "normal",
    overflow: "hidden",
    textAlign: "center",
    // multi-line: no bottom padding and an exact height, so marks of the next (hidden) line never peek out
    padding: lines > 1 ? 0 : `0 0 ${u(6)}`,
    ...(lines > 1
      ? {
          display: "-webkit-box",
          WebkitLineClamp: lines,
          WebkitBoxOrient: "vertical",
          overflowWrap: "anywhere",
          maxHeight: `${lines * 1.35}em`,
        }
      : { whiteSpace: "nowrap", textOverflow: "ellipsis" }),
  };
  return (
    <motion.div
      className="font-display text-white"
      style={style}
      initial={{ opacity: 0, y: reduce ? 0 : 12, filter: textGlow(0) }}
      animate={{ opacity: 1, y: 0, filter: reduce ? textGlow(0.35) : [textGlow(0), textGlow(1), textGlow(0.45)] }}
      transition={{
        opacity: { duration: reduce ? 0.3 : 0.9, delay: reduce ? 0.2 : TEXT_AT, ease: "easeOut" },
        y: { duration: 1, delay: TEXT_AT, ease },
        filter: { duration: reduce ? 0.3 : 1.8, delay: reduce ? 0.2 : TEXT_AT, times: [0, 0.5, 1], ease: "easeOut" },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * The moment after "ลอยกระทง !": a dusk scene (dark shade, unlit kratong) where the wish glows in, the candle catches
 * and the shade lifts, then an idle loop until it continues to the river (tap, key, or ~5.2s).
 */
export function Reveal({ data }: { data: AnyResultData }) {
  const reduce = useReducedMotion();
  const { leaving, go } = useContinue(reduce ? 150 : 550);
  const [lit, setLit] = useState(false);
  const name = data.wish?.name?.trim() ?? "";
  // the wish replaces "โอมเพี้ยง !" (kept as the fallback when there is no wish text)
  const wish = data.wish?.content?.trim() ?? "";

  useEffect(() => {
    const t = window.setTimeout(() => setLit(true), (reduce ? 0.7 : LIGHT_AT) * 1000);
    return () => window.clearTimeout(t);
  }, [reduce]);

  const at = reduce ? 0.7 : LIGHT_AT;
  const dur = reduce ? 0.4 : 1.3;

  return (
    <main className="fixed inset-0 overflow-hidden antialiased select-none bg-sky-bottom">
      <motion.div
        className="absolute inset-0"
        animate={leaving ? { opacity: 0, y: reduce ? 0 : -24, scale: reduce ? 1 : 1.03 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <TealSky />

        {/* water */}
        <Stage anchor="bottom">
          <Water />
        </Stage>

        {/* moon + clouds */}
        <Stage>
          <Clouds />
          <MovingMoon pose={POSE} float={reduce ? 0 : 1.5} />
        </Stage>

        {/* dusk shade: sits over the scenery, under the kratong and the text */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(5,16,46,.74) 0%, rgba(8,28,66,.66) 55%, rgba(4,14,38,.74) 100%)" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: dur + 0.4, delay: at + 0.1, ease: "easeInOut" }}
        />

        {/* kratong, glow and ripples (water-anchored so they sit on the water at every size) */}
        <Stage anchor="bottom">
          {/* warm bloom behind the kratong, then breathing */}
          <Layer x={CX - 230} y={TOP + H * 0.45 - 230} w={460} h={460} className="pointer-events-none">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,214,130,.75) 0%, rgba(255,170,70,.38) 34%, rgba(255,140,50,.12) 58%, rgba(255,140,50,0) 72%)",
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={
                reduce
                  ? { opacity: 0.8, scale: 1 }
                  : { opacity: [0, 1, 0.78, 1, 0.78], scale: [0.4, 1.12, 1, 1.08, 1] }
              }
              transition={
                reduce
                  ? { duration: 0.5, delay: at }
                  : { duration: 4.5, delay: at, times: [0, 0.18, 0.5, 0.75, 1], ease: "easeInOut", repeat: Infinity, repeatDelay: 0 }
              }
            />
          </Layer>

          {/* the flash as the candle catches */}
          {!reduce && (
            <Layer x={CX - 110} y={TOP + H * FLAME_Y - 110} w={220} h={220} className="pointer-events-none" style={{ zIndex: 7 }}>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,246,206,.95) 0%, rgba(255,200,110,.55) 32%, rgba(255,170,80,0) 70%)" }}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 1, 0], scale: [0.3, 1.1, 1.5] }}
                transition={{ duration: 0.9, delay: at, times: [0, 0.25, 1], ease: "easeOut" }}
              />
            </Layer>
          )}

          <Ripples reduce={reduce} />

          {/* soft reflection */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: u(CX - SIZE / 2),
              top: u(BOTTOM - H),
              width: u(SIZE),
              height: u(H),
              transformOrigin: "50% 100%",
              transform: "scaleY(-0.5)",
              opacity: 0.2,
              filter: "brightness(0.4) sepia(1) hue-rotate(165deg) saturate(2.2) blur(1.5px)",
              WebkitMaskImage: "linear-gradient(to top, #000 30%, transparent 100%)",
              maskImage: "linear-gradient(to top, #000 30%, transparent 100%)",
            }}
          >
            <Kratong selected={data.kratong} height={u(SIZE)} zIndex={1} lit={false} />
          </div>

          {/* the kratong: dark at dusk (brightness .35), then brightens as it lights; gentle bob */}
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: u(CX - SIZE / 2), top: u(TOP), width: u(SIZE), height: u(H), zIndex: 5 }}
            animate={reduce ? undefined : { y: [0, `calc(var(--u) * -3.5)`, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ filter: "brightness(0.35)" }}
              animate={{ filter: "brightness(1)" }}
              transition={{ duration: dur, delay: at, ease: "easeOut" }}
            >
              <Kratong selected={data.kratong} height={u(SIZE)} zIndex={5} lit={lit} />
            </motion.div>
          </motion.div>

          {lit && !reduce && <Embers />}
        </Stage>

        {/* text, above the shade */}
        <Stage>
          <GlowLine y={205} fontSize={26} reduce={reduce}>
            {name}
          </GlowLine>
          {wish ? (
            <GlowLine y={246} fontSize={24} lines={4} reduce={reduce}>
              {wish}
            </GlowLine>
          ) : (
            <GlowLine y={243} fontSize={46} reduce={reduce}>
              {CAPTION}
            </GlowLine>
          )}
          <div className="lg:hidden">
            <NavHeader />
          </div>
        </Stage>

        {/* Desktop: pin the logo to the viewport corner, as the story does. */}
        <div
          className="absolute z-[99] hidden lg:block"
          style={{ left: "calc(100vw / 1440 * 37)", top: "calc(100vw / 1440 * 34)", ["--u" as string]: "calc(100vw / 1440)" }}
        >
          <Logo />
        </div>
      </motion.div>

      <button type="button" aria-label="ไปลอยกระทง" className="absolute inset-0 z-[70] cursor-pointer" onClick={go}>
        {/* hidden until 2.6s (outer fade), then the story's blinking pulse (inner); a delayed keyframe loop alone
            jumps straight to its first keyframe, which showed the hint from the start */}
        <motion.span
          className="pointer-events-none absolute inset-x-0 text-center font-noto text-white"
          style={{ bottom: "3.2dvh", fontSize: "clamp(13px, 2.4dvh, 22px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.5, ease: "easeOut" }}
        >
          <motion.span
            className="inline-block"
            animate={{ opacity: [0.27, 0.75, 0.27] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            แตะเพื่อไปต่อ
          </motion.span>
        </motion.span>
      </button>
    </main>
  );
}
