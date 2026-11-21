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

/** Principal's kratong (Principal/create.tsx) */
export interface PrincipalSelected {
  base: string;
  swan: string;
  candles: string;
  decorations: string;
}

/** CUPSAA kratong (CUPSAA/create.tsx) */
export interface CupsaaSelected {
  base: string;
  flowers: string;
  candles: string;
}

export interface ResultData {
  kratong: KratongSelected;
  wish: Wish;
}

export interface PrincipalResultData {
  kratong: PrincipalSelected;
  wish: Wish;
}

export interface CupsaaResultData {
  kratong: CupsaaSelected;
  wish: Wish;
}

export type KratongData = ResultData;
export type PrincipalKratongData = PrincipalResultData;
export type CupsaaKratongData = CupsaaResultData;

export type AnyResultData = ResultData | PrincipalResultData | CupsaaResultData;

/** Common return shape of all server actions. */
export type ActionResult<T = undefined> =
  | { status: true; report: string; data: T }
  | { status: false; report: string; data?: { location?: string } };
