"use client";
/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from "motion/react";
import { Layer } from "./frame";

interface Box {
  x: number;
  y: number;
  size: number;
}

const V2 = "/assets/figma-v2/story";
/** The glow is one blurred-circle SVG (cover Ellipse 133, 253 design px); it bleeds 13.04% past its layer (negative Figma inset). */
const GLOW_SRC = `${V2}/moon-glow-253.svg`;
const GLOW_INSET = 13.04;
/** The orange-cat moon art (cover Group 6297); the SVG bleeds 1.35% past the body layer. */
const MOON_SRC = `${V2}/moon-cat.svg`;
const MOON_INSET = 1.35;

function Glow() {
  return (
    <div className="absolute" style={{ inset: `-${GLOW_INSET}%` }}>
      <img alt="" className="block size-full max-w-none" src={GLOW_SRC} />
    </div>
  );
}

function Body() {
  return (
    <div className="absolute pointer-events-none" style={{ inset: `-${MOON_INSET}%` }}>
      <img alt="ดวงจันทร์" className="block size-full max-w-none" src={MOON_SRC} />
    </div>
  );
}

/** Moon (orange cat): blurred glow circle + body, at any size. `glow` / `body` are frame-coordinate boxes. */
export function Moon({ glow, body }: { glow: Box; body: Box }) {
  return (
    <>
      <Layer x={glow.x} y={glow.y} w={glow.size} h={glow.size}>
        <Glow />
      </Layer>
      <Layer x={body.x} y={body.y} w={body.size} h={body.size}>
        <Body />
      </Layer>
    </>
  );
}

/** Pose of the story moon: Figma glow + body boxes of one scene. */
export interface MoonPose {
  glow: Box;
  body: Box;
}

/** The cover pose (glow 253 / body 257, Figma 187:476 / 195:629) every MovingMoon is laid out at before it is transformed to a pose. */
const BASE = { glow: { x: 60, y: 113, size: 253 }, body: { x: 60, y: 113, size: 257 } };

function toTransform(base: Box, to: Box) {
  const dx = to.x + to.size / 2 - (base.x + base.size / 2);
  const dy = to.y + to.size / 2 - (base.y + base.size / 2);
  // x / y percentages are relative to the element's own size, so they stay unit-free (no `--u` needed)
  return { x: `${(dx / base.size) * 100}%`, y: `${(dy / base.size) * 100}%`, scale: to.size / base.size };
}

/**
 * Moon that glides (position + size) to `pose` whenever it changes: the old story's `moonVariants`
 * mapped onto the Figma moon boxes. Same art as `Moon`; the cover-size glow is scaled to each pose.
 * `float` adds a very slow bob (px of the design, off with reduced motion).
 */
export function MovingMoon({
  pose,
  duration = 0.7,
  float = 0,
}: {
  pose: MoonPose;
  duration?: number;
  float?: number;
}) {
  const reduce = useReducedMotion();
  const t = { duration: reduce ? 0.2 : duration, ease: [0.45, 0, 0.2, 1] as [number, number, number, number] };
  return (
    <>
      <Layer x={BASE.glow.x} y={BASE.glow.y} w={253} h={253}>
        <motion.div className="absolute inset-0" initial={false} animate={toTransform(BASE.glow, pose.glow)} transition={t}>
          <Glow />
        </motion.div>
      </Layer>
      <Layer x={BASE.body.x} y={BASE.body.y} w={BASE.body.size} h={BASE.body.size}>
        <motion.div className="absolute inset-0" initial={false} animate={toTransform(BASE.body, pose.body)} transition={t}>
          <MoonFloat float={reduce ? 0 : float}>
            <Body />
          </MoonFloat>
        </motion.div>
      </Layer>
    </>
  );
}

function MoonFloat({ float, children }: { float: number; children: React.ReactNode }) {
  if (!float) return <>{children}</>;
  return (
    <motion.div
      className="absolute inset-0"
      animate={{ y: [0, -float, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
