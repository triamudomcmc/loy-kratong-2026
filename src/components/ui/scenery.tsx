/* eslint-disable @next/next/no-img-element */
import { Cloud } from "./cloud";
import { Layer } from "./frame";

const A = "/assets/figma/ui/scenery";

/**
 * Mobile "below" scenery of Scene 4 / Scene 5 (Figma 91:696 / 91:716): small clouds, water,
 * brick floor and the sala. Back-to-front, frame 375 x 812. Put the moon and text above it.
 * `water="single"` = Scene 4 (one wave strip), `water="layered"` = Scene 5 (three strips).
 */
export function MobileScenery({ water = "single" }: { water?: "single" | "layered" }) {
  return (
    <>
      {/* เมฆ (drift slowly) */}
      <Cloud name="cloud-small" x={-35} y={124} w={146.807} h={99.006} opacity={0.13} drift={8} driftDuration={16} />
      <Cloud name="cloud-small" x={266} y={85} w={155} h={109} opacity={0.13} drift={7} driftDuration={19} driftDelay={-4} />
      <Cloud name="cloud-small" x={56} y={77} w={120} h={83} opacity={0.13} drift={9} driftDuration={14} driftDelay={-7} />
      <Cloud name="cloud-small" x={168} y={139} w={92} h={64} opacity={0.13} drift={10} driftDuration={17} driftDelay={-2} />

      {water === "single" ? (
        <Layer x={-375} y={563} w={1008} h={248}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/water-single.svg`} />
        </Layer>
      ) : (
        <>
          <Layer x={-297} y={563} w={930} h={222}>
            <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/water-top.svg`} />
          </Layer>
          <Layer x={-329} y={573} w={930} h={226}>
            <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/water-mid.svg`} />
          </Layer>
          <Layer x={-375} y={585} w={930} h={226}>
            <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/water-bottom.svg`} />
          </Layer>
        </>
      )}

      {/* Untitled_Artwork (1) 1: brick floor, cropped */}
      <Layer x={-135} y={727} w={621.482} h={175.853} className="overflow-hidden pointer-events-none">
        <img
          alt=""
          className="absolute max-w-none"
          style={{ height: "384.49%", left: "-3.26%", top: "-284.49%", width: "106.52%" }}
          src={`${A}/floor.png`}
        />
      </Layer>
      {/* ศาลา */}
      <Layer x={-108} y={340} w={584} h={584}>
        <img
          alt="ศาลา"
          className="absolute inset-0 size-full max-w-none object-cover pointer-events-none"
          src={`${A}/sala.png`}
        />
      </Layer>
    </>
  );
}
