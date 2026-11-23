"use client";

import type { FC } from "react";
import { Kratong } from "@components/Kratong/kratong";
import { PrincipalKratong } from "@components/Principal/kratong";
import { CUPSAAKratong } from "@components/CUPSAA/kratong";
import type { CupsaaKratongData, KratongData, PrincipalKratongData } from "@types-app/kratong";
import { u } from "@components/ui";

export type RiverKind = "normal" | "principal" | "cupsaa";
export type RiverData = KratongData | PrincipalKratongData | CupsaaKratongData;

/** Infers the kratong family from its parts (DB rows carry no kind): principal has a swan, CUPSAA has no decorations. */
export function kindOf(data: RiverData): RiverKind {
  const k = data.kratong as object;
  if ("swan" in k) return "principal";
  if (!("decorations" in k)) return "cupsaa";
  return "normal";
}

/** Renders one of the three kratong families at `w` design px wide (`--size` of the part renderers). */
export const KratongArt: FC<{ kind: RiverKind; data: RiverData; w: number; zIndex?: number }> = ({
  kind,
  data,
  w,
  zIndex = 29,
}) => {
  const height = u(w);
  if (kind === "principal")
    return <PrincipalKratong selected={(data as PrincipalKratongData).kratong} height={height} zIndex={zIndex} />;
  if (kind === "cupsaa")
    return <CUPSAAKratong selected={(data as CupsaaKratongData).kratong} height={height} zIndex={zIndex} />;
  return <Kratong selected={(data as KratongData).kratong} height={height} zIndex={zIndex} />;
};
