import "server-only";
import { prisma } from "./db";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wordcut = require("wordcut");

export interface Blocklist {
  blocked: string[];
  dict: string[];
}

const CACHE_TTL_MS = 60_000;
let cache: { at: number; list: Blocklist } | null = null;

/** Fetch the blocklist and base dictionary, cached in memory for about a minute. */
export async function loadBlocklist(): Promise<Blocklist> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.list;
  const [blocked, dict] = await Promise.all([prisma.blockedWord.findMany(), prisma.dictionaryWord.findMany()]);
  const list: Blocklist = { blocked: blocked.map((w) => w.word), dict: dict.map((w) => w.word) };
  cache = { at: Date.now(), list };
  return list;
}

export function isCursed(text: string, list: Blocklist): boolean {
  wordcut.init("./dict.txt", true, [...list.blocked, ...list.dict]);
  const words: string[] = wordcut.cut(text.replace(/ /g, "")).split("|");
  return words.some((word) => list.blocked.includes(word));
}
