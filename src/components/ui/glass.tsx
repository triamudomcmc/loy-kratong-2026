import type { CSSProperties, ReactNode } from "react";
import { Layer, u } from "./frame";
import { Logo } from "./logo";
import { TealSky } from "./sky";

/** `--u` of the foreground stage: the 375 x 812 design fits the viewport (contain). */
export const STAGE_U = "calc(min(100vw / 375, 100dvh / 812))";
/**
 * A 375 x 812 design frame centred in its (positioned) parent and scaled to fit it (`--u` = STAGE_U),
 * so the card keeps its Figma size at every viewport without scrolling.
 */
export function StageFrame({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={`absolute inset-0 m-auto ${className}`}
      style={{ ["--u" as string]: STAGE_U, width: u(375), height: u(812) }}
    >
      {children}
    </div>
  );
}

/**
 * Blue glass backdrop of Scene 19 / 20 / 21 and the save modal (Figma Scene 19 187:551, "bg" 187:566), filling the whole
 * viewport: the blue sky gradient (183.82deg, #4ed1d8 -> #1286b1) with backdrop-blur 14, which hides everything behind it,
 * and the logo nav. Render it first, inside a `fixed inset-0` / positioned parent.
 */
export function GlassBackdrop({ nav = true }: { nav?: boolean }) {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden" style={{ ["--u" as string]: STAGE_U }}>
        <TealSky />
        <div
          className="absolute inset-0"
          style={{ backdropFilter: `blur(${u(14)})`, WebkitBackdropFilter: `blur(${u(14)})` }}
        />
      </div>
      {nav && (
        // Logo pinned to the viewport corner (not the centred column): mobile size below lg, desktop size from lg.
        <header className="pointer-events-none fixed left-0 top-0 z-[99] w-full" style={{ ["--u" as string]: "calc(min(100vw, 430px) / 375)" }}>
          <div className="absolute lg:hidden" style={{ left: u(24), top: u(19) }}>
            <Logo />
          </div>
          <div className="absolute hidden lg:block" style={{ left: "calc(100vw / 1440 * 37)", top: "calc(100vw / 1440 * 34)", ["--u" as string]: "calc(100vw / 1440)" }}>
            <Logo scale={254 / 102} />
          </div>
        </header>
      )}
    </>
  );
}

interface GlassCardProps {
  /** Design px, frame relative. Defaults are Scene 5's card: 343 x 703 at (16, 72). */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  radius?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** Outer glass card (Figma "elements" 91:732): 1px white border, blur 30, white-to-clear diagonal gradient. */
export function GlassCard({ x = 16, y = 72, w = 343, h = 703, radius = 23, className = "", style, children }: GlassCardProps) {
  return (
    <Layer
      x={x}
      y={y}
      w={w}
      h={h}
      className={`overflow-clip ${className}`}
      style={{
        borderRadius: u(radius),
        border: `${u(1)} solid #fff`,
        backgroundImage: "linear-gradient(231.0258deg, rgba(255,255,255,0.3) 0%, rgba(11,11,11,0) 62.244%)",
        backdropFilter: `blur(${u(30)})`,
        WebkitBackdropFilter: `blur(${u(30)})`,
        ...style,
      }}
    >
      {children}
    </Layer>
  );
}

/**
 * Lower sheet inside a GlassCard (Figma 91:733, 343 x 443 at y=260 in the card): 0.5px white border,
 * blur 15. `dim` scales the tint/border alpha (Scene 20's sheet is 68%, baked in so the blur is kept). With `header`, adds the 56px frosted strip at its top (91:751) that holds the tabs.
 * Coordinates of children are card-relative, so absolute-position them in the card, not in the sheet.
 */
export function GlassSheet({ y = 260, w = 343, h = 443, header = true, dim = 1 }: { y?: number; w?: number; h?: number; header?: boolean; dim?: number }) {
  return (
    <>
      <Layer
        x={0}
        y={y}
        w={w}
        h={h}
        style={{
          borderRadius: u(23),
          border: `${u(0.5)} solid rgba(255,255,255,${dim})`,
          backgroundImage: `linear-gradient(239.6683deg, rgba(255,255,255,${0.6 * dim}) 2.9073%, rgba(255,254,254,${0.1 * dim}) 102.06%)`,
          backdropFilter: `blur(${u(15)})`,
          WebkitBackdropFilter: `blur(${u(15)})`,
        }}
      />
      {header && (
        <Layer
          x={0}
          y={y}
          w={w}
          h={56}
          style={{
            borderTopLeftRadius: u(23),
            borderTopRightRadius: u(23),
            backgroundImage: "linear-gradient(264.4327deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 98.426%)",
            backdropFilter: `blur(${u(9)})`,
            WebkitBackdropFilter: `blur(${u(9)})`,
          }}
        />
      )}
    </>
  );
}
