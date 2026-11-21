import "server-only";
import type { AnyResultData } from "@types-app/kratong";
import { getDb } from "./firebase";

/** Reads `kratong-por-oar/{id}`; resolves to null when missing. */
export async function getPorOarKratong(id: string): Promise<AnyResultData | null> {
  const snap = await getDb().collection("kratong-por-oar").doc(id).get();
  return snap.exists ? (snap.data() as AnyResultData) : null;
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

/** Oldest 24 filtered entities, then a random 8 of them. */
export async function getSceneEntities(): Promise<AnyResultData[]> {
  const snap = await getDb().collection("filteredEntities").orderBy("timestamp", "asc").limit(24).get();
  return getRandom(snap.docs, 8).map((item) => item.data() as AnyResultData);
}
