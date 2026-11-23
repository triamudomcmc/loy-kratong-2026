import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { u } from "./frame";

interface PillButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  variant?: "solid" | "outline";
  /** Design-px size; defaults are the mobile "ถัดไป" button 118 x 41.776. */
  w?: number;
  h?: number;
  fontSize?: number;
  radius?: number;
  /** If set, the button is absolutely positioned at these frame coordinates. */
  x?: number;
  y?: number;
  style?: CSSProperties;
}

/** White pill button (Figma "next" 91:615; outline variant from Scene 2 91:513). Hover grows, press shrinks, keyboard focus shows a white ring. */
export function PillButton({
  variant = "solid",
  w = 118,
  h = 41.776,
  fontSize = 19.011,
  radius = 22,
  x,
  y,
  className = "",
  style,
  children,
  ...rest
}: PillButtonProps) {
  const solid = variant === "solid";
  const positioned = x !== undefined || y !== undefined;
  return (
    <button
      type="button"
      className={`${positioned ? "absolute" : "relative"} font-ui font-normal text-center flex items-center justify-center transition-[filter,scale] duration-150 hover:scale-[1.06] hover:brightness-95 active:scale-[0.94] active:brightness-90 motion-reduce:hover:scale-[1.02] motion-reduce:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:ring-4 focus-visible:ring-white/40 disabled:opacity-60 disabled:pointer-events-none ${className}`}
      style={{
        left: x === undefined ? undefined : u(x),
        top: y === undefined ? undefined : u(y),
        width: u(w),
        height: u(h),
        fontSize: u(fontSize),
        lineHeight: "normal",
        borderRadius: u(radius),
        border: `${u(1)} solid var(--color-pill)`,
        background: solid ? "var(--color-pill)" : "transparent",
        color: solid ? "var(--color-ink)" : "var(--color-pill)",
        boxShadow: `0 0 ${u(1.884)} ${u(0.235)} rgba(0,0,0,0.25)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
