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

/** Oldest 24 displayed entities, then a random 8 of them. */
export async function getSceneEntities(): Promise<AnyResultData[]> {
  const rows = await prisma.kratong.findMany({
    where: { status: "DISPLAYED" },
    orderBy: { createdAt: "asc" },
    take: 24,
  });
  return getRandom(rows, 8).map(
    (row) => ({ kratong: row.kratong, wish: { name: row.wishName, content: row.wishContent } }) as unknown as AnyResultData,
  );
}
