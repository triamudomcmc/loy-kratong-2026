"use client";

import { useSyncExternalStore } from "react";
import type { CSSProperties, FC, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { u } from "@components/ui";

/**
 * One-shot reveal for /capture?animate=1 (the Snap modal preview). Every wrapper renders its children untouched when
 * `animate` is false, so the screenshot route (/api/capture) stays the static final image. Timeline (seconds):
 *   0       scene under a dark shade, user's kratong dark, name and caption hidden
 *   0.4-1.4 name and caption glow in together, bright over the dark scene
 *   1.6-2.8 shade lifts, kratong lights up (brightness 0.35 -> 1); glow blooms and breathes once (to 4.0)
 * Reduced motion: short plain fades. Nothing here touches backdrop-filter (the capture has none).
 */
type P = { animate?: boolean; children: ReactNode };
/** True once the page (images, fonts) has loaded, so the sequence starts when the preview is actually visible. */
const useLoaded = () =>
  useSyncExternalStore(
    (cb) => {
      window.addEventListener("load", cb);
      return () => window.removeEventListener("load", cb);
    },
    () => document.readyState === "complete",
    () => false,
  );

const EASE = [0.22, 1, 0.36, 1] as const;

export const RevealScene: FC<P & { className?: string; style?: CSSProperties }> = ({
  animate,
  children,
  className,
  style,
}) => {
  const reduce = useReducedMotion();
  const loaded = useLoaded();
  return (
    <div className={className} style={style}>
      {children}
      {/* The scene is darkened by a shade *under* the texts (z 60), so the words appear bright over the dark scene;
          it lifts when the kratong lights up. */}
      {animate && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ zIndex: 55 }}
          initial={{ opacity: reduce ? 0 : 0.55 }}
          animate={loaded ? { opacity: 0 } : undefined}
          transition={reduce ? { duration: 0.01 } : { duration: 1.2, delay: 1.6, ease: "easeInOut" }}
        />
      )}
    </div>
  );
};

export const RevealKratong: FC<P & { style: CSSProperties }> = ({ animate, children, style }) => {
  const reduce = useReducedMotion();
  const loaded = useLoaded();
  if (!animate)
    return (
      <div className="absolute" style={style}>
        {children}
      </div>
    );
  return (
    <motion.div
      className="absolute"
      style={style}
      initial={{ filter: reduce ? "brightness(1)" : "brightness(0.35)" }}
      animate={loaded ? { filter: "brightness(1)" } : undefined}
      transition={reduce ? { duration: 0.01 } : { duration: 1.2, delay: 1.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

/** Warm glow behind the kratong: fades in, then breathes once and settles at full strength. */
export const RevealGlow: FC<P> = ({ animate, children }) => {
  const reduce = useReducedMotion();
  const loaded = useLoaded();
  if (!animate) return <>{children}</>;
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        loaded ? (reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 1, 1], scale: [0.9, 1, 1.07, 1] }) : undefined
      }
      transition={
        reduce
          ? { duration: 0.4, delay: 1.6 }
          : { duration: 2.4, delay: 1.6, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }
      }
    >
      {children}
    </motion.div>
  );
};

export const RevealName: FC<P> = ({ animate, children }) => {
  const reduce = useReducedMotion();
  const loaded = useLoaded();
  if (!animate) return <>{children}</>;
  return (
    <motion.div
      className="size-full"
      initial={{ opacity: 0, y: reduce ? 0 : u(8), filter: "drop-shadow(0 0 0 rgba(255,255,255,0))" }}
      animate={
        loaded
          ? {
              opacity: 1,
              y: 0,
              filter: reduce
                ? "drop-shadow(0 0 0 rgba(255,255,255,0))"
                : [
                    "drop-shadow(0 0 0 rgba(255,255,255,0))",
                    `drop-shadow(0 0 ${u(8)} rgba(255,255,255,0.85))`,
                    "drop-shadow(0 0 0 rgba(255,255,255,0))",
                  ],
            }
          : undefined
      }
      transition={reduce ? { duration: 0.3, delay: 0.4 } : { duration: 0.8, delay: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

export const RevealCaption: FC<P> = ({ animate, children }) => {
  const reduce = useReducedMotion();
  const loaded = useLoaded();
  if (!animate) return <>{children}</>;
  const none = "blur(0px) drop-shadow(0 0 0 rgba(255,255,255,0))";
  return (
    <motion.div
      className="size-full"
      initial={{ opacity: 0, filter: reduce ? none : `blur(6px) drop-shadow(0 0 0 rgba(255,255,255,0))` }}
      animate={
        loaded
          ? {
              opacity: 1,
              filter: reduce
                ? none
                : [
                    `blur(6px) drop-shadow(0 0 0 rgba(255,255,255,0))`,
                    `blur(0px) drop-shadow(0 0 ${u(14)} rgba(255,255,255,0.95))`,
                    none,
                  ],
            }
          : undefined
      }
      // opacity is a single 0 -> 1 fade; only the 3-keyframe filter uses `times` (sharing them made the text
      // fade in, fade out and pop back, so it looked like it glowed twice)
      transition={
        reduce
          ? { duration: 0.3, delay: 0.4 }
          : {
              opacity: { duration: 0.5, delay: 0.4, ease: "easeOut" },
              filter: { duration: 1.0, delay: 0.4, times: [0, 0.55, 1], ease: "easeOut" },
            }
      }
    >
      {children}
    </motion.div>
  );
};
