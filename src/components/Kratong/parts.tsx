import { KratongNormalPartType, KratongVariantPartType } from "@map/kratong";

interface KratongNormalPartProps {
  part: KratongNormalPartType;
  selected: string;
}

interface KratongVariantPartProps {
  part: KratongVariantPartType;
  selected: string;
  signVariant: number;
}

export function NormalPart({ part, selected }: KratongNormalPartProps) {
  return (
    <div
      className="select-none"
      style={{ display: selected === part.id ? "inline-block" : "none" }}
    >
      <img draggable={false} className="select-none" src={part.url} alt={part.name} />
    </div>
  );
}

export function Candle({ part, selected }: KratongNormalPartProps) {
  return (
    <div
      className="select-none"
      style={{ display: selected === part.id ? "inline-block" : "none" }}
    >
      <img draggable={false} className="select-none" src={part.url} alt={part.name} />
    </div>
  );
}

export function VariantPart({ part, selected, signVariant }: KratongVariantPartProps) {
  return (
    <>
      {part.variants.map((variant: string, variantIdx) => {
        return (
          <div
            key={variantIdx}
                        style={{ display: selected === part.id && variantIdx === signVariant ? "inline-block" : "none" }}
          >
            <img draggable={false} className="select-none" src={variant} alt={part.name} />
          </div>
        );
      })}
    </>
  );
}

/*
{Object.keys(KratongMap.base).map((base: string) => {
  // @ts-ignore
  const part = KratongMap.base[base];
  if (part.type === "normal") {
    // @ts-ignore
    return <NormalPart key={base} part={KratongMap.base[base]} selected={selected.base} />;
  } else if (part.type === "variant")
    return <VariantPart key={base} part={part} selected={selected.base} />;
})}
*/
