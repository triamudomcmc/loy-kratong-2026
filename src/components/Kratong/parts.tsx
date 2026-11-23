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
export function CandlePart({ part, selected, base }: KratongNormalPartProps & { base: KratongBaseType }) {
  const lift = base.height * (base.candleLift ?? 0.5);
  return (
    <img
      draggable={false}
      className="absolute max-w-none select-none"
      style={{
        display: selected === part.id ? "block" : "none",
        width: unit(CANDLE_W),
        left: unit(UNITS / 2 - 22.7 - CANDLE_W / 2),
        bottom: unit(lift - CANDLE_BBOX_BOTTOM),
      }}
      src={part.url}
      alt={part.name}
    />
  );
}

/** Flower sitting on the base: bottom-centred, bottom edge 0.485 x base height above the base bottom. */
export function FlowerPart({ part, base }: { part: KratongFlowerType; base: KratongBaseType }) {
  return (
    <img
      draggable={false}
      className="absolute left-1/2 max-w-none -translate-x-1/2 select-none"
      style={{ width: unit(part.fit), bottom: unit(base.height * (base.flowerLift ?? 0.485)) }}
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
