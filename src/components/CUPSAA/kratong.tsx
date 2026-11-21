import { CUPSAAMap } from "@map/kratong";
import { cupsaaCls } from "@components/kratong-classes";
import { CUPSAAPart } from "./parts";
import { Selected } from "./create";

interface KratongProps {
  selected: Selected;
  height: string;
  zIndex: number;
}

/*
height: 240px
*/

export function CUPSAAKratong({ selected, height, zIndex }: KratongProps) {
  return (
    <>
      <div style={{ ["--size" as string]: height, ["--z-index" as string]: zIndex }} className={cupsaaCls.root}>
        <div className={cupsaaCls.topping}>
          <div className={cupsaaCls.logo}>
            <div>
              <img src="/assets/images/CUPSAA/logo.png" alt="CUPSAA Logo" />
            </div>
          </div>
          <div className={cupsaaCls.candle}>
            {Object.keys(CUPSAAMap.candles).map((candle: string) => {
              // @ts-expect-error map is indexed by string key
              const part = CUPSAAMap.candles[candle];
              return <CUPSAAPart key={candle} part={part} selected={selected.candles} />;
            })}
          </div>
        </div>
        <div className={cupsaaCls.base}>
          <div className={cupsaaCls.flowers}>
            {Object.keys(CUPSAAMap.flowers).map((flower: string) => {
              // @ts-expect-error map is indexed by string key
              const part = CUPSAAMap.flowers[flower];
              return <CUPSAAPart key={flower} part={part} selected={selected.flowers} />;
            })}
          </div>
          <div className={cupsaaCls.shell}>
            {Object.keys(CUPSAAMap.base).map((base: string) => {
              // @ts-expect-error map is indexed by string key
              const part = CUPSAAMap.base[base];
              return <CUPSAAPart key={base} part={part} selected={selected.base} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
