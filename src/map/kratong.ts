export type KratongNormalPartType = {
  id: string;
  type: string;
  name: string;
  description: string;
  url: string;
};

export type KratongVariantPartType = {
  id: string;
  type: string;
  name: string;
  description: string;
  variants: string[];
};

export type KratongNoDescPartType = {
  id: string;
  type: string;
  variants: string[];
};

export type KratongType = {
  name: string;
  description: string;
  id: string;
  type: string;
  url: string;
  thumbnail?: string;
};

/** New SVG base: `width`/`height` are the SVG's own size (design px). */
export type KratongBaseType = KratongType & {
  width: number;
  height: number;
  /** Bottom edge of the candle as a fraction of the base height above the base bottom (default .5, from Figma 187:966). */
  candleLift?: number;
  /**
   * Open container (the ice bowl): drawn *behind* the flower and candle, which stand on its top surface instead of
   * being tucked behind front petals. `surface` = units above the base bottom where they sit.
   */
  open?: { surface: number; flowerMax?: number };
};

/** New SVG flower: `width`/`height` natural size, `fit` = rendered width in the 341-unit kratong box. */
export type KratongFlowerType = KratongBaseType & { fit: number };

export type KratongTypeVariant = {
  name: string;
  description: string;
  id: string;
  type: string;
  variants: string[];
  thumbnails?: string[];
};

export interface KratongMapType {
  base: Record<BaseId, KratongBaseType>;
  decorations: {
    none: KratongType;
    "sign-quote": KratongTypeVariant;
    swan: KratongType;
    "sign-taken": KratongTypeVariant;
    cactus: KratongType;
    "sign-enttid": KratongTypeVariant;
    nak: KratongType;
    "sign-want-love": KratongTypeVariant;
    "sign-want-money": KratongTypeVariant;
  };
  flowers: Record<FlowerId, KratongFlowerType>;
  candles: {
    orange: KratongType;
    pink: KratongType;
    green: KratongType;
    blue: KratongType;
    yellow: KratongType;
    violet: KratongType;
  };
}

export type BaseId = "green-lotus-large" | "green-lotus" | "blue-bowl" | "pink-lotus" | "orange-lotus";
export type FlowerId = "lotus-marigold" | "pink-lotus" | "pink-blossom" | "purple-cream" | "frangipani";

/**
 * Decorations (signs, swan, naga, cactus) are switched off: no ของตกแต่ง tab in the builder and never drawn on a
 * kratong, including older saved ones. Flip to true to bring them back; the parts and data are kept.
 */
export const SHOW_DECORATIONS = false;

export const DEFAULT_BASE: BaseId = "green-lotus-large";
export const DEFAULT_FLOWER: FlowerId = "lotus-marigold";
export const DEFAULT_CANDLE = "candle-yellow";

/** Old ids (DB rows, localStorage) -> the new part that stands in for them. */
export const LEGACY_BASE: Record<string, BaseId> = {
  "banana-leaf": "green-lotus",
  "banana-leaf-2": "green-lotus-large",
  lotus: "pink-lotus",
  "coconut-shell": "orange-lotus",
  "coconut-shell-carved": "orange-lotus",
  ice: "blue-bowl",
};
export const LEGACY_FLOWER: Record<string, FlowerId> = {
  love: "pink-lotus",
  luck: "lotus-marigold",
  study: "purple-cream",
  "summer-fruits": "frangipani",
};

/**
 * Per-combination flower tweaks, on top of the general placement rules (see Kratong/parts.tsx FlowerPart).
 * `dy` = units up (negative = down), `scale` = width multiplier. Numbers match the combination sheet
 * (base row x 5 + flower position, in KratongMap order).
 */
export const FLOWER_TUNE: Partial<Record<BaseId, Partial<Record<FlowerId, { dy?: number; scale?: number }>>>> = {
  "green-lotus-large": {
    "pink-lotus": { dy: -16 }, // #2
    "pink-blossom": { dy: -24 }, // #3
    "purple-cream": { dy: 14 }, // #4
    frangipani: { dy: -8 }, // #5
  },
  "green-lotus": {
    "pink-lotus": { scale: 0.82, dy: -30 }, // #7
    "pink-blossom": { scale: 0.82, dy: -30 }, // #8
    "purple-cream": { scale: 0.88, dy: 10 }, // #9
    frangipani: { scale: 0.82, dy: -14 }, // #10
  },
  "blue-bowl": {
    "pink-blossom": { dy: -10 }, // #13
    "purple-cream": { dy: -12 }, // #14
  },
  "pink-lotus": {
    "pink-lotus": { dy: -10, scale: 0.9 }, // #17
    "pink-blossom": { dy: -10 }, // #18
    frangipani: { dy: -10 }, // #20
  },
  "orange-lotus": {
    "pink-blossom": { dy: 0, scale: 0.9 }, // #23
    "purple-cream": { dy: 10 }, // #24
    frangipani: { dy: 0, scale: 0.9 }, // #25
  },
};

export const KratongMap: KratongMapType = {
  base: {
    "green-lotus-large": {
      id: "green-lotus-large",
      type: "normal",
      name: "ใบตองบัวใหญ่",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/bases/green-lotus-large.svg",
      thumbnail: "/assets/kratong-v2/bases/green-lotus-large.svg",
      width: 341,
      height: 169,
    },
    "green-lotus": {
      id: "green-lotus",
      type: "normal",
      name: "ใบตองบัว",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/bases/green-lotus.svg",
      thumbnail: "/assets/kratong-v2/bases/green-lotus.svg",
      width: 336,
      height: 138,
    },
    "blue-bowl": {
      id: "blue-bowl",
      type: "normal",
      name: "ชามสีฟ้า",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/bases/blue-bowl.svg",
      thumbnail: "/assets/kratong-v2/bases/blue-bowl.svg",
      width: 312,
      height: 128,
      // rim ellipse centre is 31.2 units below the top (SVG ellipse cy=31.2): contents stand just behind it
      open: { surface: 92 },
    },
    "pink-lotus": {
      id: "pink-lotus",
      type: "normal",
      name: "บัวชมพู",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/bases/pink-lotus.svg",
      thumbnail: "/assets/kratong-v2/bases/pink-lotus.svg",
      width: 305,
      height: 159,
    },
    "orange-lotus": {
      id: "orange-lotus",
      type: "normal",
      name: "บัวสีส้ม",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/bases/orange-lotus.svg",
      thumbnail: "/assets/kratong-v2/bases/orange-lotus.svg",
      width: 324,
      height: 139,
    },
  },
  decorations: {
    none: {
      type: "normal",
      id: "none",
      name: "ไม่มี",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/decorations/none.png",
    },
    nak: {
      id: "nak",
      type: "normal",
      name: "พญานาค",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/decorations/nak.png",
      thumbnail: "/assets/images/kratong/thumbnail/decorations/nak.png",
    },
    swan: {
      id: "swan",
      name: "หงส์",
      type: "normal",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/decorations/swan.png",
      thumbnail: "/assets/images/kratong/thumbnail/decorations/swan.png",
    },
    cactus: {
      id: "cactus",
      type: "normal",
      name: "กระบองเพชร",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/decorations/cactus.png",
      thumbnail: "/assets/images/kratong/thumbnail/decorations/cactus.png",
    },
    "sign-want-love": {
      id: "sign-want-love",
      type: "variant",
      name: "ป้ายอยากมีหวานใจ",
      description: "คำอธิบาย",
      variants: [
        "/assets/images/kratong/decorations/sign/want-love/red.png",
        "/assets/images/kratong/decorations/sign/want-love/orange.png",
        "/assets/images/kratong/decorations/sign/want-love/violet.png",
        "/assets/images/kratong/decorations/sign/want-love/pink.png",
        "/assets/images/kratong/decorations/sign/want-love/blue.png",
        "/assets/images/kratong/decorations/sign/want-love/green.png",
      ],
      thumbnails: [
        "/assets/images/kratong/thumbnail/decorations/sign/want-love/red.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-love/orange.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-love/violet.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-love/pink.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-love/blue.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-love/green.png",
      ],
    },
    "sign-want-money": {
      id: "sign-want-money",
      type: "variant",
      name: "ป้ายอยากเป็นเศรษฐี",
      description: "คำอธิบาย",
      variants: [
        "/assets/images/kratong/decorations/sign/want-money/red.png",
        "/assets/images/kratong/decorations/sign/want-money/orange.png",
        "/assets/images/kratong/decorations/sign/want-money/violet.png",
        "/assets/images/kratong/decorations/sign/want-money/pink.png",
        "/assets/images/kratong/decorations/sign/want-money/blue.png",
        "/assets/images/kratong/decorations/sign/want-money/green.png",
      ],
      thumbnails: [
        "/assets/images/kratong/thumbnail/decorations/sign/want-money/red.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-money/orange.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-money/violet.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-money/pink.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-money/blue.png",
        "/assets/images/kratong/thumbnail/decorations/sign/want-money/green.png",
      ],
    },
    "sign-enttid": {
      id: "sign-enttid",
      type: "variant",
      name: "ป้ายเอนท์ติด",
      description: "คำอธิบาย",
      variants: [
        "/assets/images/kratong/decorations/sign/enttid/red.png",
        "/assets/images/kratong/decorations/sign/enttid/orange.png",
        "/assets/images/kratong/decorations/sign/enttid/violet.png",
        "/assets/images/kratong/decorations/sign/enttid/pink.png",
        "/assets/images/kratong/decorations/sign/enttid/blue.png",
        "/assets/images/kratong/decorations/sign/enttid/green.png",
      ],
      thumbnails: [
        "/assets/images/kratong/thumbnail/decorations/sign/enttid/red.png",
        "/assets/images/kratong/thumbnail/decorations/sign/enttid/orange.png",
        "/assets/images/kratong/thumbnail/decorations/sign/enttid/violet.png",
        "/assets/images/kratong/thumbnail/decorations/sign/enttid/pink.png",
        "/assets/images/kratong/thumbnail/decorations/sign/enttid/blue.png",
        "/assets/images/kratong/thumbnail/decorations/sign/enttid/green.png",
      ],
    },
    "sign-quote": {
      id: "sign-quote",
      type: "variant",
      name: "ป้ายคำคมสุดปัง",
      description: "คำอธิบาย",
      variants: [
        "/assets/images/kratong/decorations/sign/quote/red.png",
        "/assets/images/kratong/decorations/sign/quote/orange.png",
        "/assets/images/kratong/decorations/sign/quote/violet.png",
        "/assets/images/kratong/decorations/sign/quote/pink.png",
        "/assets/images/kratong/decorations/sign/quote/blue.png",
        "/assets/images/kratong/decorations/sign/quote/green.png",
      ],
      thumbnails: [
        "/assets/images/kratong/thumbnail/decorations/sign/quote/red.png",
        "/assets/images/kratong/thumbnail/decorations/sign/quote/orange.png",
        "/assets/images/kratong/thumbnail/decorations/sign/quote/violet.png",
        "/assets/images/kratong/thumbnail/decorations/sign/quote/pink.png",
        "/assets/images/kratong/thumbnail/decorations/sign/quote/blue.png",
        "/assets/images/kratong/thumbnail/decorations/sign/quote/green.png",
      ],
    },
    "sign-taken": {
      id: "sign-taken",
      type: "variant",
      name: "ป้ายมีคนจองแล้ว",
      description: "คำอธิบาย",
      variants: [
        "/assets/images/kratong/decorations/sign/taken/red.png",
        "/assets/images/kratong/decorations/sign/taken/orange.png",
        "/assets/images/kratong/decorations/sign/taken/violet.png",
        "/assets/images/kratong/decorations/sign/taken/pink.png",
        "/assets/images/kratong/decorations/sign/taken/blue.png",
        "/assets/images/kratong/decorations/sign/taken/green.png",
      ],
      thumbnails: [
        "/assets/images/kratong/thumbnail/decorations/sign/taken/red.png",
        "/assets/images/kratong/thumbnail/decorations/sign/taken/orange.png",
        "/assets/images/kratong/thumbnail/decorations/sign/taken/violet.png",
        "/assets/images/kratong/thumbnail/decorations/sign/taken/pink.png",
        "/assets/images/kratong/thumbnail/decorations/sign/taken/blue.png",
        "/assets/images/kratong/thumbnail/decorations/sign/taken/green.png",
      ],
    },
  },
  flowers: {
    "lotus-marigold": {
      id: "lotus-marigold",
      type: "normal",
      name: "บัวชมพูดาวเรือง",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/flowers/lotus-marigold.svg",
      thumbnail: "/assets/kratong-v2/flowers/lotus-marigold.svg",
      width: 236,
      height: 119,
      fit: 289,
    },
    "pink-lotus": {
      id: "pink-lotus",
      type: "normal",
      name: "บัวชมพูกลีบเรียง",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/flowers/pink-lotus.svg",
      thumbnail: "/assets/kratong-v2/flowers/pink-lotus.svg",
      width: 225,
      height: 76,
      fit: 320,
    },
    "pink-blossom": {
      id: "pink-blossom",
      type: "normal",
      name: "ดอกไม้ชมพูม่วง",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/flowers/pink-blossom.svg",
      thumbnail: "/assets/kratong-v2/flowers/pink-blossom.svg",
      width: 195,
      height: 70,
      fit: 300,
    },
    "purple-cream": {
      id: "purple-cream",
      type: "normal",
      name: "บัวม่วงครีม",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/flowers/purple-cream.svg",
      thumbnail: "/assets/kratong-v2/flowers/purple-cream.svg",
      width: 238,
      height: 140,
      fit: 250,
    },
    "frangipani": {
      id: "frangipani",
      type: "normal",
      name: "ลีลาวดี",
      description: "คำอธิบาย",
      url: "/assets/kratong-v2/flowers/frangipani.svg",
      thumbnail: "/assets/kratong-v2/flowers/frangipani.svg",
      width: 328,
      height: 110,
      fit: 300,
    },
  },
  candles: {
    yellow: {
      id: "candle-yellow",
      type: "normal",
      name: "สีเหลือง",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/candles/yellow.png",
      thumbnail: "/assets/images/kratong/thumbnail/candles/yellow.png",
    },
    blue: {
      id: "candle-blue",
      type: "normal",
      name: "สีฟ้า",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/candles/blue.png",
      thumbnail: "/assets/images/kratong/thumbnail/candles/blue.png",
    },
    green: {
      id: "candle-green",
      type: "normal",
      name: "สีเขียว",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/candles/green.png",
      thumbnail: "/assets/images/kratong/thumbnail/candles/green.png",
    },
    orange: {
      id: "candle-orange",
      type: "normal",
      name: "สีส้ม",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/candles/orange.png",
      thumbnail: "/assets/images/kratong/thumbnail/candles/orange.png",
    },
    pink: {
      id: "candle-pink",
      type: "normal",
      name: "สีชมพู",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/candles/pink.png",
      thumbnail: "/assets/images/kratong/thumbnail/candles/pink.png",
    },
    violet: {
      id: "candle-violet",
      type: "normal",
      name: "สีม่วง",
      description: "คำอธิบาย",
      url: "/assets/images/kratong/candles/violet.png",
      thumbnail: "/assets/images/kratong/thumbnail/candles/violet.png",
    },
  },
};

/** Maps any base id (new, legacy or unknown) to a current base id. */
export function resolveBase(id: unknown): BaseId {
  if (typeof id === "string") {
    if (id in KratongMap.base) return id as BaseId;
    if (id in LEGACY_BASE) return LEGACY_BASE[id];
  }
  return DEFAULT_BASE;
}

/** Maps any flower id (new, legacy or unknown) to a current flower id. */
export function resolveFlower(id: unknown): FlowerId | "none" {
  if (id === "none") return "none"; // no flower: only for fixed scenes (story); the builder never offers it
  if (typeof id === "string") {
    if (id in KratongMap.flowers) return id as FlowerId;
    if (id in LEGACY_FLOWER) return LEGACY_FLOWER[id];
  }
  return DEFAULT_FLOWER;
}

/** Unknown candle ids fall back to the yellow candle. */
export function resolveCandle(id: unknown): string {
  return Object.values(KratongMap.candles).some((c) => c.id === id) ? (id as string) : DEFAULT_CANDLE;
}

/** Normalises a stored selection (old DB rows / localStorage) so every part id exists. */
export function normalizeSelected<T extends { base?: unknown; flowers?: unknown; candles?: unknown; decorations?: unknown; signVariant?: unknown }>(
  s: T,
): { base: BaseId; flowers: FlowerId | "none"; candles: string; decorations: string; signVariant: number } {
  const dec = typeof s.decorations === "string" && s.decorations in KratongMap.decorations ? s.decorations : "none";
  const sv = typeof s.signVariant === "number" && s.signVariant >= 0 && s.signVariant < 6 ? s.signVariant : 0;
  return { base: resolveBase(s.base), flowers: resolveFlower(s.flowers), candles: resolveCandle(s.candles), decorations: dec, signVariant: sv };
}
