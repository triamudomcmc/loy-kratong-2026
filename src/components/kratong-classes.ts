// Tailwind class maps replacing Kratong/Principal/CUPSAA.module.scss.
// Each key matches the old SCSS class name. `--size` defaults to 512px and is
// overridden by the inline style the components set; `--z-index` is always
// set inline. The old nested selectors (`.kratong > .base > .shell` etc.) are
// flattened onto the elements themselves, which sit at the same depth.

const scene =
  "h-screen bg-[linear-gradient(182.71deg,#281981_-2.41%,#3a71b3_47.53%,#1a3270_100.68%)]";

const aura =
  "relative top-0 left-[-25px] h-[calc(var(--size)+50px)] w-[calc(var(--size)+50px)] rounded-full bg-[#fef3c7] opacity-30 blur-[10px]";

export const kratongCls = {
  root: "relative z-[var(--z-index)] w-[var(--size)] [--size:512px]",
  aura,
  caura:
    "relative top-0 left-[-85px] h-[calc(var(--size)+150px)] w-[calc(var(--size)+150px)] rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,#fdf188_0%,rgba(247,244,159,0)_100%)] opacity-50 blur-[10px]",
  topping: "",
  decorations: "absolute top-0 z-[calc(var(--z-index)-3)]",
  candle: "absolute top-0 z-[calc(var(--z-index)-2)]",
  base: "inline-block",
  flowers: "absolute top-0 z-[calc(var(--z-index)-1)]",
  shell: "absolute top-0 z-[var(--z-index)]",
} as const;

export const principalCls = {
  root: "relative w-[var(--size)] [--size:512px]",
  aura,
  topping: "",
  decorations: "absolute top-0 z-[calc(var(--z-index)-3)]",
  candle: "absolute top-0 z-[calc(var(--z-index)-2)]",
  base: "inline-block",
  swan: "absolute top-0 z-[calc(var(--z-index)-1)]",
  shell: "absolute top-0 z-[var(--z-index)]",
  scene,
} as const;

export const cupsaaCls = {
  root: "relative w-[var(--size)] [--size:512px]",
  topping: "",
  candle: "absolute top-0 z-[calc(var(--z-index)-3)]",
  logo: "absolute top-0 z-[var(--z-index)]",
  base: "inline-block",
  flowers: "absolute top-0 z-[calc(var(--z-index)-2)]",
  shell: "absolute top-0 z-[calc(var(--z-index)-1)]",
  scene,
} as const;
