"use client";
/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from "motion/react";
import { Layer } from "./frame";

interface Box {
  x: number;
  y: number;
  size: number;
}

/** Glow art is a blurred circle; the SVG bleeds past the layer by `inset` percent (negative inset in Figma). */
const GLOWS: Record<number, { src: string; inset: number }> = {
  253: { src: "/assets/figma/ui/moon-glow-253.svg", inset: 13.04 }, // ปก, Scene 1
  279: { src: "/assets/figma/ui/moon-glow-279.svg", inset: 11.83 }, // Scene 2, 3
  99: { src: "/assets/figma/ui/moon-glow-99.svg", inset: 33.33 }, // Scene 4, 5
  202: { src: "/assets/figma/ui/moon-glow-202.svg", inset: 19.97 }, // Scene 17
};

/** Moon (Figma "Mooooon 2" + "Ellipse 13x" glow). `glow.size` must be 253, 279, 99 or 202. */
export function Moon({ glow, body }: { glow: Box; body: Box }) {
  const g = GLOWS[glow.size];
  return (
    <>
      <Layer x={glow.x} y={glow.y} w={glow.size} h={glow.size}>
        <div className="absolute" style={{ inset: `-${g.inset}%` }}>
          <img alt="" className="block size-full max-w-none" src={g.src} />
        </div>
      </Layer>
      <Layer x={body.x} y={body.y} w={body.size} h={body.size}>
        <img
          alt="ดวงจันทร์"
          className="absolute inset-0 size-full max-w-none object-cover pointer-events-none"
          src="/assets/figma/ui/moon.gif"
        />
      </Layer>
    </>
  );
}

/** The small yellow rabbit-ear piece layered over the moon in Scene 2 / Scene 3 (Union 91:515, 91:529). */
export function MoonRabbitEar() {
  return (
    <Layer x={158} y={280} w={57} h={110.712}>
      <img alt="" className="absolute block inset-0 size-full max-w-none" src="/assets/figma/ui/moon-rabbit-ear.svg" />
    </Layer>
  );
}

/** Pose of the story moon: Figma glow + body boxes of one scene. */
export interface MoonPose {
  glow: Box;
  body: Box;
}

/** The cover pose (glow 253 / body 257) every MovingMoon is laid out at before it is transformed to a pose. */
const BASE = { glow: { x: 60, y: 113, size: 253 }, body: { x: 59, y: 109, size: 257 } };

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
  const g = GLOWS[253];
  return (
    <>
      <Layer x={BASE.glow.x} y={BASE.glow.y} w={253} h={253}>
        <motion.div className="absolute inset-0" initial={false} animate={toTransform(BASE.glow, pose.glow)} transition={t}>
          <div className="absolute" style={{ inset: `-${g.inset}%` }}>
            <img alt="" className="block size-full max-w-none" src={g.src} />
          </div>
        </motion.div>
      </Layer>
      <Layer x={BASE.body.x} y={BASE.body.y} w={BASE.body.size} h={BASE.body.size}>
        <motion.div className="absolute inset-0" initial={false} animate={toTransform(BASE.body, pose.body)} transition={t}>
          <MoonFloat float={reduce ? 0 : float}>
            <img
              alt="ดวงจันทร์"
              className="absolute inset-0 size-full max-w-none object-cover pointer-events-none"
              src="/assets/figma/ui/moon.gif"
            />
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
