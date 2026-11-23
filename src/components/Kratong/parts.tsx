/* eslint-disable @next/next/no-img-element */
import type { KratongBaseType, KratongFlowerType, KratongNormalPartType, KratongVariantPartType } from "@map/kratong";

interface KratongNormalPartProps {
  part: KratongNormalPartType;
  selected: string;
}

interface KratongVariantPartProps {
  part: KratongVariantPartType;
  selected: string;
  signVariant: number;
}

/** Full-canvas (2048x2400) layers: decorations and candles stay hidden until selected so they are preloaded. */
export function NormalPart({ part, selected }: KratongNormalPartProps) {
  return (
    <div className="absolute inset-0 select-none" style={{ display: selected === part.id ? "block" : "none" }}>
      <img draggable={false} className="size-full select-none" src={part.url} alt={part.name} />
    </div>
  );
}

export function VariantPart({ part, selected, signVariant }: KratongVariantPartProps) {
  return (
    <>
      {part.variants.map((variant: string, variantIdx) => (
        <div
          key={variantIdx}
          className="absolute inset-0 select-none"
          style={{ display: selected === part.id && variantIdx === signVariant ? "block" : "none" }}
        >
          <img draggable={false} className="size-full select-none" src={variant} alt={part.name} />
        </div>
      ))}
    </>
  );
}

/** One kratong "design unit" = size/UNITS: the box is 341 units wide (the widest base SVG at 1:1). */
export const UNITS = 341;
const unit = (n: number) => `calc(var(--size) * ${n / UNITS})`;

/** Candle + incense layer. Figma 187:966: candle height = 0.46 x base width, standing 0.5 x base height above the base bottom. */
const CANDLE_W = 230.6; // canvas width in units (2048px canvas scaled so the 1394px candle = 157 units)
const CANDLE_H = (CANDLE_W * 2400) / 2048;
const CANDLE_BBOX_BOTTOM = (CANDLE_H * (2400 - 1394)) / 2400; // transparent strip under the candle in the canvas
/** Flame region of the 2048x2400 candle PNG (all colours share it); removed from the image when the candle is unlit. */
const NO_FLAME = "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 44.9% 12.5%, 55.7% 12.5%, 55.7% 27.4%, 44.9% 27.4%, 44.9% 12.5%)";

export function CandlePart({ part, selected, base, lit = true }: KratongNormalPartProps & { base: KratongBaseType; lit?: boolean }) {
  const lift = base.open ? base.open.surface : base.height * (base.candleLift ?? 0.5);
  return (
    <img
      draggable={false}
      className="absolute max-w-none select-none"
      style={{
        display: selected === part.id ? "block" : "none",
        width: unit(CANDLE_W),
        left: unit(UNITS / 2 - 22.7 - CANDLE_W / 2),
        bottom: unit(lift - CANDLE_BBOX_BOTTOM),
        clipPath: lit ? undefined : NO_FLAME,
      }}
      src={part.url}
      alt={part.name}
    />
  );
}

/** Petals rise this many units above the base's top edge (Figma 187:966: flower top 59 units above the base top). */
const FLOWER_RISE = 59;

/** Flower on the base: bottom-centred, its top FLOWER_RISE units above the base top so it always reads clearly in front of the base's tips. */
/** A flower is never wider than this share of its base (open cups use their own `flowerMax`). */
const FLOWER_MAX = 0.92;

export function FlowerPart({ part, base }: { part: KratongFlowerType; base: KratongBaseType }) {
  const w = Math.min(part.fit, base.width * (base.open?.flowerMax ?? FLOWER_MAX));
  const h = (w * part.height) / part.width;
  // open bowl: the flower stands on the bowl's surface; otherwise its top rises FLOWER_RISE above the base top
  const bottom = base.open ? base.open.surface - 6 : Math.max(0, base.height + FLOWER_RISE - h);
  return (
    <img
      draggable={false}
      className="absolute left-1/2 max-w-none -translate-x-1/2 select-none"
      style={{ width: unit(w), bottom: unit(bottom) }}
      src={part.url}
      alt={part.name}
    />
  );
}

/** Base: bottom-centred at its own SVG size (1 unit = 1 SVG px). */
export function BasePart({ part }: { part: KratongBaseType }) {
  return (
    <img
      draggable={false}
      className="absolute bottom-0 left-1/2 max-w-none -translate-x-1/2 select-none"
      style={{ width: unit(part.width) }}
      src={part.url}
      alt={part.name}
    />
  );
}
