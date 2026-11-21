import { PrincipalMap } from "@map/kratong";
import { principalCls } from "@components/kratong-classes";
import { PrincipalPart } from "./parts";
import { Selected } from "./create";

interface KratongProps {
  selected: Selected;
  height: string;
  zIndex: number;
}

/*
height: 240px
offset: 60px
*/

export function PrincipalKratong({ selected, height, zIndex }: KratongProps) {
  return (
    <>
      <div style={{ ["--size" as string]: height, ["--z-index" as string]: zIndex }} className={principalCls.root}>
        <div className={principalCls.topping}>
          <div className={principalCls.decorations}>
            {Object.keys(PrincipalMap.decorations).map((decoration: string) => {
              // @ts-expect-error map is indexed by string key
              const part = PrincipalMap.decorations[decoration];
              return <PrincipalPart key={decoration} part={part} selected={selected.decorations} />;
            })}
          </div>
          <div className={principalCls.candle}>
            {Object.keys(PrincipalMap.candles).map((candle: string) => {
              // @ts-expect-error map is indexed by string key
              const part = PrincipalMap.candles[candle];
              return <PrincipalPart key={candle} part={part} selected={selected.candles} />;
            })}
          </div>
        </div>
        <div className={principalCls.base}>
          <div className={principalCls.swan}>
            {Object.keys(PrincipalMap.swan).map((swan: string) => {
              // @ts-expect-error map is indexed by string key
              const part = PrincipalMap.swan[swan];
              return <PrincipalPart key={swan} part={part} selected={selected.swan} />;
            })}
          </div>
          {/* changeme */}
          <div className={principalCls.shell}>
            {Object.keys(PrincipalMap.base).map((base: string) => {
              // @ts-expect-error map is indexed by string key
              const part = PrincipalMap.base[base];
              return <PrincipalPart key={base} part={part} selected={selected.base} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
