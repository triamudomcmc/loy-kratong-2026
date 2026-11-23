// Shared kratong data types. Server code imports from here so it never
// depends on client components. The create.tsx components re-export these.

export interface Wish {
  name: string;
  content: string;
}

/** Standard kratong (Kratong/create.tsx) */
export interface KratongSelected {
  base: string;
  flowers: string;
  candles: string;
  decorations: string;
  signVariant: number;
}

export interface ResultData {
  kratong: KratongSelected;
  wish: Wish;
}

export type KratongData = ResultData;
/** Kept as an alias: only standard kratongs exist now. */
export type AnyResultData = ResultData;

/** Common return shape of all server actions. */
export type ActionResult<T = undefined> =
  | { status: true; report: string; data: T }
  | { status: false; report: string; data?: { location?: string } };
