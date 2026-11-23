/* eslint-disable @next/next/no-img-element */
import { Cloud } from "./cloud";
import { Layer, u } from "./frame";

const A = "/assets/figma-v2/scenery";

/** Water strips are mirrored sideways past the frame so they never end inside a wide viewport (a mirror joins seamlessly). */
function Strip({ x, y, w, h, src }: { x: number; y: number; w: number; h: number; src: string }) {
  return (
    <>
      {[-2, -1, 0, 1, 2].map((k) => (
        <Layer key={k} x={x + k * w} y={y} w={w} h={h} style={{ transform: k % 2 ? "scaleX(-1)" : undefined }}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={src} />
        </Layer>
      ))}
    </>
  );
}

/**
 * Mobile "below" scenery of the story's Scene 22 (Figma 195:4802 "below" + the new orange sala 195:5706): small clouds,
 * water, brick floor and the sala with its pool, back to front, frame 375 x 812. Put the moon, text and the real
 * kratong above it. `water="single"` = one wave strip (Scene 22), `water="layered"` = three strips.
 * The sala SVG (kratongs removed) is faded at its far ends and the plank is extended, so wide viewports stay filled.
 */
export function MobileScenery({ water = "single" }: { water?: "single" | "layered" }) {
  return (
    <>
      {/* เมฆ (drift slowly) */}
      <Cloud name="cloud-small" src={`${A}/cloud-small.svg`} x={-35} y={124} w={146.807} h={99.006} opacity={0.13} drift={8} driftDuration={16} />
      <Cloud name="cloud-small" src={`${A}/cloud-small.svg`} x={266} y={85} w={155} h={109} opacity={0.13} drift={7} driftDuration={19} driftDelay={-4} />
      <Cloud name="cloud-small" src={`${A}/cloud-small.svg`} x={56} y={77} w={120} h={83} opacity={0.13} drift={9} driftDuration={14} driftDelay={-7} />
      <Cloud name="cloud-small" src={`${A}/cloud-small.svg`} x={168} y={139} w={92} h={64} opacity={0.13} drift={10} driftDuration={17} driftDelay={-2} />

      {water === "single" ? (
        <Strip x={-375} y={563} w={1008} h={248} src={`${A}/water-single.svg`} />
      ) : (
        <>
          <Strip x={-297} y={563} w={930} h={222} src={`${A}/water-top.svg`} />
          <Strip x={-329} y={573} w={930} h={226} src={`${A}/water-mid.svg`} />
          <Strip x={-375} y={585} w={930} h={226} src={`${A}/water-bottom.svg`} />
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

      {/* plank (Group 6313 > Rectangle 28, #EAC249, x -310.5..694.4) continued beyond the sala SVG */}
      <Layer x={-3000} y={655.49} w={2689.5} h={22.934} style={{ background: "#EAC249" }} />
      <Layer x={694.37} y={655.49} w={3000} h={22.934} style={{ background: "#EAC249" }} />
      {/* ศาลา (Group 6325 without its kratongs): scene x -328, y 375.11, 1032 x 586 */}
      <Layer x={-328} y={375.11} w={1032} h={586}>
        <img
          alt="ศาลา"
          className="absolute inset-0 size-full max-w-none pointer-events-none"
          style={{
            maskImage: `linear-gradient(to right, transparent 0, #000 ${u(140)}, #000 calc(100% - ${u(140)}), transparent 100%)`,
            WebkitMaskImage: `linear-gradient(to right, transparent 0, #000 ${u(140)}, #000 calc(100% - ${u(140)}), transparent 100%)`,
          }}
          src={`${A}/sala-scene22.svg`}
        />
      </Layer>
    </>
  );
}
