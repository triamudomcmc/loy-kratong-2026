import "server-only";
import { getDb } from "./firebase";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wordcut = require("wordcut");

export interface Blocklist {
  blocked: string[];
  dict: string[];
}

/** Fetch the blocklist and base dictionary once per request. */
export async function loadBlocklist(): Promise<Blocklist> {
  const db = getDb();
  const [main, dict] = await Promise.all([
    db.collection("database").doc("main").get(),
    db.collection("database").doc("dict").get(),
  ]);
  return {
    blocked: String(main.get("data") ?? "").split(" "),
    dict: String(dict.get("5000") ?? "").split(" "),
  };
}

export function isCursed(text: string, list: Blocklist): boolean {
  wordcut.init("./dict.txt", true, [...list.blocked, ...list.dict]);
  const words: string[] = wordcut.cut(text.replace(/ /g, "")).split("|");
  return words.some((word) => list.blocked.includes(word));
}
