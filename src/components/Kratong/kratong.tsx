import { KratongMap } from "@map/kratong";
import { kratongCls } from "@components/kratong-classes";
import { NormalPart, VariantPart, Candle } from "./parts";
import { Selected } from "./create";
import clsx from "clsx";

interface KratongProps {
  selected: Selected;
  height: string;
  zIndex: number;
  className?: string;
}

/*
height: 240px
offset: 60px
*/

export function Kratong({ selected, height, zIndex, className }: KratongProps) {
  return (
    <>
      <div
        style={{ ["--size" as string]: height, ["--z-index" as string]: zIndex }}
        className={clsx(kratongCls.root, className)}
      >
        <div className={kratongCls.topping}>
          <div className={kratongCls.decorations}>
            {Object.keys(KratongMap.decorations).map((decoration: string) => {
              // @ts-expect-error map is indexed by string key
              const part = KratongMap.decorations[decoration];
              if (part.type === "normal")
                return <NormalPart key={decoration} part={part} selected={selected.decorations} />;
              else if (part.type === "variant")
                return (
                  <VariantPart
                    key={decoration}
                    part={part}
                    selected={selected.decorations}
                    signVariant={selected.signVariant}
                  />
                );
            })}
          </div>
          <div className={kratongCls.candle}>
            {Object.keys(KratongMap.candles).map((candle: string) => {
              // @ts-expect-error map is indexed by string key
              const part = KratongMap.candles[candle];
              return <Candle key={candle} part={part} selected={selected.candles} />;
            })}
          </div>
        </div>
        <div className={kratongCls.base}>
          <div className={kratongCls.flowers}>
            {Object.keys(KratongMap.flowers).map((flower: string) => {
              // @ts-expect-error map is indexed by string key
              const part = KratongMap.flowers[flower];
              if (part.type === "normal") return <NormalPart key={flower} part={part} selected={selected.flowers} />;
              else if (part.type === "variant")
                return (
                  <VariantPart
                    key={flower}
                    part={part}
                    selected={selected.flowers}
                    signVariant={selected.signVariant}
                  />
                );
            })}
          </div>
          <div className={kratongCls.shell}>
            {Object.keys(KratongMap.base).map((base: string) => {
              // @ts-expect-error map is indexed by string key
              const part = KratongMap.base[base];
              if (part.type === "normal") {
                return <NormalPart key={base} part={part} selected={selected.base} />;
              } else if (part.type === "variant")
                return (
                  <VariantPart key={base} part={part} selected={selected.base} signVariant={selected.signVariant} />
                );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
