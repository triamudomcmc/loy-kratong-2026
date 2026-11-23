"use client";

import type { FC } from "react";
import { Kratong } from "@components/Kratong/kratong";
import type { KratongData } from "@types-app/kratong";
import { u } from "@components/ui";

export type RiverKind = "normal";
export type RiverData = KratongData;

/**
 * DB rows carry no kind. Only the standard kratong exists now: anything shaped differently (old
 * principal rows have a `swan`, CUPSAA rows have no `decorations`) returns null and must be skipped.
 */
export function kindOf(data: RiverData): RiverKind | null {
  const k = data?.kratong as unknown as Record<string, unknown> | undefined;
  if (!k || typeof k !== "object") return null;
  if ("swan" in k || !("decorations" in k)) return null;
  return "normal";
}

/** Renders the standard kratong at `w` design px wide (`--size` of the part renderer). */
export const KratongArt: FC<{ kind: RiverKind; data: RiverData; w: number; zIndex?: number }> = ({
  data,
  w,
  zIndex = 29,
}) => <Kratong selected={data.kratong} height={u(w)} zIndex={zIndex} />;
