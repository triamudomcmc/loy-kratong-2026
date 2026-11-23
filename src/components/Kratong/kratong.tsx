import { KratongMap, SHOW_DECORATIONS, normalizeSelected } from "@map/kratong";
import { kratongCls } from "@components/kratong-classes";
import { BasePart, CandlePart, FlowerPart, NormalPart, VariantPart } from "./parts";
import type { Selected } from "./create";
import clsx from "clsx";

interface KratongProps {
  selected: Selected;
  /** CSS length: rendered width of the whole kratong box (height is 1.171875x). Becomes `--size`. */
  height: string;
  zIndex: number;
  className?: string;
  /** false = candle without its flame (night share image). Default true. */
  lit?: boolean;
}

/**
 * One kratong from parts, in a box `--size` wide and `--size * 2400/2048` tall (342 x 400 design units):
 *   decorations (full-box canvases) < flower < candle + incense < base (bottom-centred, own SVG size).
 * Composition from Figma 187:966 / 187:551: the flower sits on the base, its bottom edge 0.485 x base
 * height above the base bottom; the candle bottom 0.5 x base height above it. Unknown / legacy ids are
 * mapped to defaults (see `normalizeSelected`).
 */
export function Kratong({ selected, height, zIndex, className, lit = true }: KratongProps) {
  const s = normalizeSelected(selected);
  const base = KratongMap.base[s.base];
  const flower = s.flowers === "none" ? null : KratongMap.flowers[s.flowers];
  return (
    <div
      style={{ ["--size" as string]: height, ["--z-index" as string]: zIndex }}
      className={clsx(kratongCls.root, className)}
    >
      <div className={kratongCls.decorations}>
        {SHOW_DECORATIONS && Object.values(KratongMap.decorations).map((part) =>
          part.type === "variant" && "variants" in part ? (
            <VariantPart key={part.id} part={part} selected={s.decorations} signVariant={s.signVariant} />
          ) : (
            <NormalPart key={part.id} part={part as never} selected={s.decorations} />
          ),
        )}
      </div>
      {/* the candle always sits between base and flower: closed bases flower < candle < base, open bases base < candle < flower */}
      <div className={base.open ? kratongCls.flowerOver : kratongCls.flower}>
        {flower && <FlowerPart part={flower} base={base} />}
      </div>
      <div className={kratongCls.candle}>
        {Object.values(KratongMap.candles).map((part) => (
          <CandlePart key={part.id} part={part} selected={s.candles} base={base} lit={lit} />
        ))}
      </div>
      <div className={base.open ? kratongCls.baseUnder : kratongCls.base}>
        <BasePart part={base} />
      </div>
    </div>
  );
}
