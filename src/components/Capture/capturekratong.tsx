"use client";

import type { FC } from "react";
import { Kratong } from "@components/Kratong/kratong";
import type { KratongData } from "@types-app/kratong";

/** Standard kratong at `size` (CSS length used as the renderer's `--size`). */
export const StandardKratong: FC<{ data: KratongData; size: string }> = ({ data, size }) => (
  <Kratong selected={data.kratong} height={size} zIndex={29} />
);
