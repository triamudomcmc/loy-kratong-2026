// Tailwind class maps for the kratong renderer (Kratong/kratong.tsx).
// `--size` is the rendered width of the whole kratong box (default 512px, overridden inline) and
// `--z-index` is always set inline. The box is a 341 x 400 "unit" canvas (height = size * 2400/2048);
// parts are positioned in those units: see Kratong/kratong.tsx.

export const kratongCls = {
  root: "relative z-[var(--z-index)] w-[var(--size)] h-[calc(var(--size)*1.171875)] [--size:512px]",
  aura: "absolute left-[-25px] top-0 h-[calc(var(--size)+50px)] w-[calc(var(--size)+50px)] rounded-full bg-[#fef3c7] opacity-30 blur-[10px]",
  caura:
    "absolute left-[-85px] top-0 h-[calc(var(--size)+150px)] w-[calc(var(--size)+150px)] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#fdf188_0%,rgba(247,244,159,0)_100%)] opacity-50 blur-[10px]",
  decorations: "absolute inset-0 z-[calc(var(--z-index)-3)]",
  flower: "absolute inset-0 z-[calc(var(--z-index)-2)]",
  candle: "absolute inset-0 z-[calc(var(--z-index)-1)]",
  base: "absolute inset-0 z-[var(--z-index)]",
  /** open bases (ice bowl) sit behind everything else so the contents stand on top of them */
  baseUnder: "absolute inset-0 z-[calc(var(--z-index)-4)]",
} as const;
