/* eslint-disable @next/next/no-img-element */
"use client";

import type { CSSProperties, FC, ReactNode } from "react";
import { Layer, Moon, NavHeader, TealSky, u } from "@components/ui";
import type { AnyResultData, CupsaaKratongData, KratongData, PrincipalKratongData } from "@types-app/kratong";
import { StandardKratong as Kratong } from "./capturekratong";
import { PrincipalKratong } from "@components/Principal/kratong";
import { CUPSAAKratong } from "@components/CUPSAA/kratong";

const A = "/assets/figma/capture";

/** Figma-layer box with percent insets (negative insets bleed past the box). */
const Bleed = ({ inset, src }: { inset: string; src: string }) => (
  <div className="absolute" style={{ inset }}>
    <img alt="" className="block size-full max-w-none" src={src} />
  </div>
);

interface Place {
  x: number;
  y: number;
  size: number;
  z: number;
  filter?: string;
}

/** The user's kratong: picks the renderer from the shape of the saved data. */
const UserKratong: FC<{ data: AnyResultData; place: Place }> = ({ data, place }) => {
  const k = data.kratong as unknown as Record<string, string | number>;
  const size = u(place.size);
  let node: ReactNode;
  if ("swan" in k) node = <PrincipalKratong selected={data.kratong as PrincipalKratongData["kratong"]} height={size} zIndex={place.z} />;
  else if (!("decorations" in k)) node = <CUPSAAKratong selected={data.kratong as CupsaaKratongData["kratong"]} height={size} zIndex={place.z} />;
  else node = <Kratong data={data as KratongData} size={size} />;
  return (
    <div className="absolute" style={{ left: u(place.x), top: u(place.y), zIndex: place.z, filter: place.filter }}>
      {node}
    </div>
  );
};

const mk = (
  base: string,
  candles: string,
  decorations: string,
  flowers: string,
  signVariant: number,
): KratongData => ({ kratong: { base, candles, decorations, flowers, signVariant }, wish: { name: "", content: "" } });

/** Surrounding kratongs (Figma 91:1029, 91:1030, 91:1044, 91:1045). */
const OTHERS: { data: KratongData; place: Place }[] = [
  { data: mk("banana-leaf", "candle-yellow", "sign-want-love", "love", 0), place: { x: -15, y: 340, size: 100, z: 2, filter: "brightness(.45)" } },
  { data: mk("ice", "candle-yellow", "sign-quote", "luck", 1), place: { x: 367, y: 349, size: 90.653, z: 3 } },
  { data: mk("coconut-shell", "candle-yellow", "sign-enttid", "summer-fruits", 0), place: { x: 315, y: 516, size: 160, z: 6 } },
  { data: mk("ice", "candle-blue", "sign-want-money", "study", 1), place: { x: -38, y: 520, size: 155, z: 7, filter: "brightness(.8)" } },
];

const CENTER: Place = { x: 90, y: 283, size: 250, z: 5 };

/**
 * Share image (Figma หน้าบันทึกหน้าจอ 91:1023, 431x812) screenshotted by /api/capture at 1080x1920.
 * `--u` = 100vh / 812, so the design fills the viewport height; the design box is centred and the sky,
 * water and skyline bleed sideways to fill the (slightly wider) viewport.
 */
export const CaptureKratong: FC<{ data: AnyResultData }> = ({ data }) => {
  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ ["--u" as string]: "calc(100vh / 812)" } as CSSProperties}
    >
      <TealSky />
      <div className="absolute top-0 h-full" style={{ left: `calc(50% - ${u(215.5)})`, width: u(431) }}>
        {/* water (back to front: น้ำ 3, น้ำ 2, น้ำ 1 ล่างสุด) */}
        <Layer x={-1473} y={406} w={2934} h={512}>
          <Bleed inset="-6.84% -1.02% -4.88% -1.02%" src={`${A}/water-3.svg`} />
        </Layer>
        <div className="absolute" style={{ inset: "64.66% -227.38% -31.29% -359.86%" }}>
          <Bleed inset="-6.47% -1.01% -4.62% -1.01%" src={`${A}/water-2.svg`} />
        </div>
        <div className="absolute" style={{ inset: "82.27% -293.04% -48.9% -361.72%" }}>
          <Bleed inset="-6.47% -0.92% -4.62% -0.92%" src={`${A}/water-1.svg`} />
        </div>
        <Layer
          x={299}
          y={540}
          w={70}
          h={55}
          style={{ backgroundImage: "linear-gradient(to bottom, rgba(52,143,197,0) 0%, #348fc5 32.575%)" }}
        />
        {/* skyline */}
        <Layer x={-1871} y={112.61} w={2370} h={299.722}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.44 }}>
            <img
              alt=""
              className="absolute left-0 w-full max-w-none"
              style={{ height: "330.89%", top: "-168.53%" }}
              src={`${A}/buildings.png`}
            />
          </div>
        </Layer>

        {OTHERS.slice(0, 2).map((o, i) => (
          <UserKratong key={i} data={o.data} place={o.place} />
        ))}
        <Layer x={45} y={294} w={335} h={335}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/glow-center.svg`} />
        </Layer>
        <UserKratong data={data} place={CENTER} />
        {OTHERS.slice(2).map((o, i) => (
          <UserKratong key={i} data={o.data} place={o.place} />
        ))}

        {/* clouds, opacity 13% */}
        <Layer x={260} y={113} w={146.807} h={99.006} style={{ opacity: 0.13 }}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/cloud-3.svg`} />
        </Layer>
        <Layer x={154} y={188} w={113} h={78} style={{ opacity: 0.13 }}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/cloud-4.svg`} />
        </Layer>
        <Layer x={-31} y={99} w={185} h={113} style={{ opacity: 0.13, transform: "scaleX(-1)" }}>
          <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${A}/cloud-6.svg`} />
        </Layer>

        {/* fireworks (GIFs) */}
        <Layer x={79} y={50} w={266} h={266} style={{ transform: "scaleX(-1)" }}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt=""
              className="absolute max-w-none size-full"
              style={{ left: "14.16%", top: "-7.79%" }}
              src={`${A}/fireworks-5.png`}
            />
          </div>
        </Layer>

        <NavHeader />
        <Layer x={85} y={718} w={272} h={32} className="text-center text-white">
          <p className="font-display" style={{ fontSize: u(36), lineHeight: "normal", whiteSpace: "nowrap" }}>
            ว้าว กระทงของคุณเท่จัง !
          </p>
        </Layer>
        <Moon glow={{ x: 269, y: 50, size: 99 }} body={{ x: 269, y: 49, size: 101 }} />
      </div>
    </div>
  );
};
