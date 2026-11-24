import "server-only";
import type { AnyResultData } from "@types-app/kratong";
import { prisma } from "./db";

/** Reads the invite record for `id`; resolves to null when missing. */
export async function getPorOarKratong(id: string): Promise<AnyResultData | null> {
  const row = await prisma.specialKratong.findUnique({ where: { id } });
  if (!row) return null;
  return { kratong: row.kratong, wish: { name: row.wishName, content: row.wishContent } } as unknown as AnyResultData;
}

function getRandom<T>(arr: T[], n: number): T[] {
  const result: T[] = new Array(Math.min(n, arr.length));
  let len = arr.length;
  const taken: Record<number, number> = {};
  if (n > len) n = len;
  while (n--) {
    const x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

/** How many recent displayed kratongs the river draws from, and how many it shows per visit. */
const SCENE_POOL = 50;
const SCENE_SHOW = 8;
/** Hard cap on pinned kratongs shown at once (newest pin first). */
const PINNED_MAX = 10;
/** Random non-pinned kratongs shown alongside pinned ones, so other people's kratongs still reach the river. */
const SCENE_RANDOM = 6;

/**
 * Every pinned + displayed kratong (newest pin first, up to PINNED_MAX), plus random non-pinned ones from the
 * newest SCENE_POOL: SCENE_SHOW when nothing is pinned, otherwise SCENE_RANDOM (so at most 16 in total).
 * Pinned ones come first so they land in the good lanes.
 */
export async function getSceneEntities(): Promise<AnyResultData[]> {
  const pinned = await prisma.kratong.findMany({
    where: { status: "DISPLAYED", pinned: true },
    orderBy: [{ pinnedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: PINNED_MAX,
  });
  const rest = await prisma.kratong.findMany({
    where: { status: "DISPLAYED", pinned: false },
    orderBy: { createdAt: "desc" },
    take: SCENE_POOL,
  });
  const randomCount = pinned.length === 0 ? SCENE_SHOW : SCENE_RANDOM;
  return [...pinned, ...getRandom(rest, randomCount)].map(
    (row) => ({ kratong: row.kratong, wish: { name: row.wishName, content: row.wishContent } }) as unknown as AnyResultData,
  );
}
