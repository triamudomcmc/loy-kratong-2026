/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, FC, ReactNode } from "react";
import { Kratong } from "@components/Kratong/kratong";
import { Layer, Moon, NavHeader, TealSky, u } from "@components/ui";
import type { AnyResultData, KratongSelected } from "@types-app/kratong";

const A = "/assets/figma-v2/capture";

export type CaptureStyle = "day" | "night";

const CAPTION = "โอมเพี้ยง !";

/** Figma-layer box with percent insets (negative insets bleed past the box). */
const Bleed = ({ inset, src }: { inset: string; src: string }) => (
  <div className="absolute" style={{ inset }}>
    <img alt="" className="block size-full max-w-none" src={src} />
  </div>
);

const Img = ({ src }: { src: string }) => <img alt="" className="absolute block inset-0 size-full max-w-none" src={src} />;

/** A fireworks piece: box (x,y,w,h) holding an inner image of iw x ih, optionally rotated / flipped. */
const FwPart = ({
  src,
  box,
  inner,
  rotate,
  flipY,
}: {
  src: string;
  box: [number, number, number, number];
  inner?: [number, number];
  rotate?: number;
  flipY?: boolean;
}) => (
  <Layer x={box[0]} y={box[1]} w={box[2]} h={box[3]}>
    {inner ? (
      <div className="flex size-full items-center justify-center">
        <div
          className="relative flex-none"
          style={{
            width: u(inner[0]),
            height: u(inner[1]),
            transform: `${rotate ? `rotate(${rotate}deg) ` : ""}${flipY ? "scaleY(-1)" : ""}`.trim() || undefined,
          }}
        >
          <Img src={src} />
        </div>
      </div>
    ) : (
      <Img src={src} />
    )}
  </Layer>
);

/** Group 6310 (196:1538): the yellow firework. Child boxes are in frame coordinates. */
const FireworkA = () => (
  <>
    <FwPart src={`${A}/fw-a-0.svg`} box={[80.46, 109.76, 30.194, 33.83]} />
    <FwPart src={`${A}/fw-a-1.svg`} box={[24, 54.52, 177.886, 179.54]} inner={[150.817, 148.637]} rotate={77.44} />
    <FwPart
      src={`${A}/fw-a-2.svg`}
      box={[118.28, 135.89, 38.587, 34.163]}
      inner={[28.239, 33.829]}
      rotate={-100.98}
      flipY
    />
    <FwPart src={`${A}/fw-a-3.svg`} box={[69.94, 141.99, 51.979, 45.306]} inner={[51.979, 45.306]} flipY />
  </>
);

/** Group 6311 (196:1571): the white firework. */
const FireworkB = () => (
  <>
    <FwPart src={`${A}/fw-b-0.svg`} box={[195.44, 201.5, 26.528, 29.722]} />
    <FwPart src={`${A}/fw-b-1.svg`} box={[145.84, 152.97, 156.284, 157.737]} inner={[132.502, 130.587]} rotate={77.44} />
    <FwPart
      src={`${A}/fw-b-2.svg`}
      box={[228.67, 224.46, 33.901, 30.014]}
      inner={[24.809, 29.721]}
      rotate={-100.98}
      flipY
    />
    <FwPart src={`${A}/fw-b-3.svg`} box={[186.2, 229.82, 45.667, 39.805]} inner={[45.667, 39.805]} flipY />
  </>
);

const mk = (base: string, candles: string, decorations: string, flowers: string): KratongSelected => ({
  base,
  candles,
  decorations,
  flowers,
  signVariant: 0,
});

/** Decorative side kratongs (fixed part combinations, no data): left orange lotus, right blue bowl. */
const LEFT = mk("orange-lotus", "candle-orange", "none", "lotus-marigold");
const RIGHT = mk("blue-bowl", "candle-yellow", "none", "none");

/**
 * A kratong standing on the water with its mirror ghost underneath.
 * `cx` = horizontal centre, `bottom` = the base's bottom edge y, `size` = renderer width (--size).
 */
const Standing: FC<{ selected: KratongSelected; cx: number; bottom: number; size: number; z: number; ghost?: boolean; lit?: boolean }> = ({
  selected,
  cx,
  bottom,
  size,
  z,
  ghost = true,
  lit = true,
}) => {
  const h = (size * 2400) / 2048;
  return (
    <>
      {ghost && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: u(cx - size / 2),
            top: u(bottom - h),
            width: u(size),
            height: u(h),
            transformOrigin: "50% 100%",
            transform: "scaleY(-0.55)",
            opacity: 0.22,
            filter: "brightness(0.35) sepia(1) hue-rotate(165deg) saturate(2.2) blur(1.5px)",
            WebkitMaskImage: "linear-gradient(to top, #000 35%, transparent 100%)",
            maskImage: "linear-gradient(to top, #000 35%, transparent 100%)",
          }}
        >
          <Kratong selected={selected} height={u(size)} zIndex={1} lit={lit} />
        </div>
      )}
      <div className="absolute" style={{ left: u(cx - size / 2), top: u(bottom - h), zIndex: z }}>
        <Kratong selected={selected} height={u(size)} zIndex={z} lit={lit} />
      </div>
    </>
  );
};

const Water = ({ night }: { night: boolean }) => {
  const s = night ? "-night" : "";
  return (
    <>
      <Layer x={-1473} y={406} w={2934} h={512}>
        <Bleed inset="-6.84% -1.02% -4.88% -1.02%" src={`${A}/water-3${s}.svg`} />
      </Layer>
      <Layer x={-1551} y={525} w={2962} h={541.061}>
        <Bleed inset="-6.47% -1.01% -4.62% -1.01%" src={`${A}/water-2${s}.svg`} />
      </Layer>
      <Layer x={-1559} y={668} w={3253} h={541.061}>
        <Bleed inset="-6.47% -0.92% -4.62% -0.92%" src={`${A}/water-1${s}.svg`} />
      </Layer>
    </>
  );
};

/** Wraps a layer so that it multiplies with everything painted before it (the SVGs' own blend mode is lost inside <img>). */
const Multiply = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div className="pointer-events-none absolute inset-0" style={{ mixBlendMode: "multiply", ...style }}>
    {children}
  </div>
);

/**
 * Share image (Figma หน้าบันทึกหน้าจอ, day 187:966 / night 200:2726, 431x812) screenshotted by /api/capture at
 * 1080x1920. `--u` = 100vh / 812, so the design fills the viewport height; the design box is centred and the sky,
 * water and skyline bleed sideways to fill the (slightly wider) viewport. Fully static: nothing animates.
 */
export const CaptureKratong: FC<{ data: AnyResultData; style?: CaptureStyle }> = ({ data, style = "day" }) => {
  const night = style === "night";
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ ["--u" as string]: "calc(100vh / 812)" } as CSSProperties}
    >
      <TealSky />
      <div className="absolute top-0 h-full" style={{ left: `calc(50% - ${u(215.5)})`, width: u(431) }}>
        <Water night={night} />
        {/* skyline */}
        <Layer x={-1871} y={112.606} w={2370} h={299.722}>
          <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: 0.44 }}>
            <img
              alt=""
              className="absolute left-0 w-full max-w-none"
              style={{ height: "330.89%", top: "-168.53%" }}
              src={`${A}/buildings.png`}
            />
          </div>
        </Layer>

        {/* Ellipse 151: candle glow behind the user's kratong */}
        <Layer x={45} y={294} w={335} h={335}>
          <Img src={`${A}/glow-day.svg`} />
        </Layer>

        {/* clouds, opacity 13% */}
        <Layer x={260} y={113} w={146.807} h={99.006} style={{ opacity: 0.13 }}>
          <Img src={`${A}/cloud-3.svg`} />
        </Layer>
        <Layer x={154} y={188} w={113} h={78} style={{ opacity: 0.13 }}>
          <Img src={`${A}/cloud-4.svg`} />
        </Layer>
        <Layer x={-31} y={99} w={185} h={113} style={{ opacity: 0.13, transform: "scaleX(-1)" }}>
          <Img src={`${A}/cloud-6.svg`} />
        </Layer>

        {night && (
          <Multiply>
            {/* Vector 1144 (200:3596): the night shade, x -84 / y -1971 / 649x2811 (stretched sideways to cover the bleed).
                It only darkens the sky, skyline and water: the fireworks, moon and every kratong sit above it. */}
            <Layer x={-84} y={-1971.06} w={649.155} h={2811.119} style={{ transform: "scaleX(1.12)" }}>
              <Img src={`${A}/night-shade.svg`} />
            </Layer>
          </Multiply>
        )}

        {night && (
          /* Ellipse 152 (260:691): the cold glow behind the kratongs (normal blend) */
          <Layer x={49.669} y={294} w={335} h={335}>
            <Img src={`${A}/night-glow.svg`} />
          </Layer>
        )}

        <FireworkA />
        <FireworkB />


        <Standing selected={LEFT} cx={24.6} bottom={448} size={152.5} z={2} lit={false} />
        <Standing selected={RIGHT} cx={417.6} bottom={702.5} size={239} z={3} lit={false} />
        <Standing selected={data.kratong} cx={215.5} bottom={583} size={300.3} z={5} lit={false} />

        <div className="absolute inset-0" style={{ zIndex: 60 }}>
          <NavHeader />
        </div>
        <Layer x={85} y={718} w={272} h={32} className="text-center text-white" style={{ zIndex: 60 }}>
          <p className="font-display" style={{ fontSize: u(36), lineHeight: "normal", whiteSpace: "nowrap" }}>
            {CAPTION}
          </p>
        </Layer>
        <div className="absolute inset-0" style={{ zIndex: 60 }}>
          <Moon glow={{ x: 269, y: 50, size: 99 }} body={{ x: 269, y: 49, size: 101 }} />
        </div>
      </div>
    </div>
  );
};
