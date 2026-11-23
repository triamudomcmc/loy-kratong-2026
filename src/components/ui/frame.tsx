import type { CSSProperties, ReactNode } from "react";

/** `calc(var(--u) * n)`: n Figma pixels, scaled by the surrounding Frame / fixed nav. */
export const u = (n: number) => `calc(var(--u) * ${n})`;

interface FrameProps {
  /** `mobile`: 375x812 scaled to min(100vw, 430px). `desktop`: 1440x1024 scaled to 100vw. */
  mode?: "mobile" | "desktop" | "fit";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Root of a Figma frame. Sets `--u` (= container width / frame width) so that children can
 * be positioned with `u(n)` at their exact Figma coordinates. Styles live in globals.css.
 */
export function Frame({ mode = "mobile", className = "", style, children }: FrameProps) {
  return (
    <div className={`frame-${mode} relative overflow-hidden ${className}`} style={style}>
      {children}
    </div>
  );
}

/**
 * Viewport-filling layer for scenery that must bleed to every edge at every screen size.
 * It renders an `absolute inset-0 overflow-hidden` box (put it inside a positioned parent such as
 * `fixed inset-0`) holding one box at the Figma frame size scaled to fit: `--u = min(100vw/375, 100dvh/812)`
 * (`desktop`: `min(100vw/1440, 100dvh/1024)`). `anchor="center"` centres it, `"bottom"` keeps it on the bottom edge
 * (use for water / sala / floor so they never leave a gap under them). Children use `u(n)` / `Layer` as in a Frame
 * but may overflow the box: only the Stage clips.
 */
export function Stage({
  anchor = "center",
  desktop = false,
  className = "",
  boxClassName = "",
  style,
  children,
}: {
  anchor?: "center" | "bottom";
  desktop?: boolean;
  className?: string;
  boxClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} style={style}>
      <div
        className={`stage-box ${anchor === "bottom" ? "stage-box-bottom" : ""} ${desktop ? "stage-box-desktop" : ""} ${boxClassName}`}
      >
        {children}
      </div>
    </div>
  );
}

interface LayerProps {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Absolutely positioned box at Figma x/y/w/h (frame-relative). */
export function Layer({ x, y, w, h, className = "", style, children }: LayerProps) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: x === undefined ? undefined : u(x),
        top: y === undefined ? undefined : u(y),
        width: w === undefined ? undefined : u(w),
        height: h === undefined ? undefined : u(h),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
