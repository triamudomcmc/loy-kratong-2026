"use client";
/* eslint-disable @next/next/no-img-element */
import { motion, useReducedMotion } from "motion/react";
import { Layer } from "./frame";

/**
 * A cloud ("Union") SVG at exact frame coordinates. Each SVG file already carries its own
 * gradient / opacity, so pick the file for the node you are copying. `rotate` is in degrees
 * about the cloud's centre; x/y/w/h are the *unrotated* box.
 *
 * `drift`: gentle sideways sway (amplitude as % of the cloud's width; `true` = 5). `driftDuration` is the
 * seconds for one sweep (default 12, alternating), `driftDelay` offsets it so clouds don't move in lockstep.
 * With prefers-reduced-motion the sway is reduced to a third and slowed down, not removed.
 */
export function Cloud({
  name,
  x,
  y,
  w,
  h,
  rotate,
  opacity,
  drift,
  driftDuration = 12,
  driftDelay = 0,
  src,
}: {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate?: number;
  opacity?: number;
  drift?: boolean | number;
  driftDuration?: number;
  driftDelay?: number;
  /** override the file path (defaults to the shared clouds folder) */
  src?: string;
}) {
  const reduce = useReducedMotion();
  const file = src ?? `/assets/figma/ui/clouds/${name}.svg`;
  const amp = drift ? (drift === true ? 5 : drift) * (reduce ? 0.33 : 1) : 0;
  return (
    <Layer x={x} y={y} w={w} h={h} style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, opacity }}>
      {amp ? (
        <motion.div
          className="absolute inset-0"
          initial={{ x: `${-amp}%` }}
          animate={{ x: `${amp}%` }}
          transition={{
            duration: driftDuration * (reduce ? 2 : 1),
            delay: driftDelay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={file} />
        </motion.div>
      ) : (
        <img alt="" className="absolute block inset-0 size-full max-w-none" src={file} />
      )}
    </Layer>
  );
}
