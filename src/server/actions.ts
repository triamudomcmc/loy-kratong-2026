"use server";

import type { AnyResultData } from "@types-app/kratong";
import { getDb } from "./firebase";
import { isCursed, loadBlocklist } from "./profanity";

export type EntityRecord = Record<string, unknown> & { id: string };

export async function pushKratong({
  data,
}: {
  data: AnyResultData;
}): Promise<
  | { status: true; report: "success"; data: { id: string } }
  | { status: false; report: "cursed"; data: { location: "name" | "content" } }
  | { status: false; report: "unexpected_error" }
> {
  try {
    const list = await loadBlocklist();

    if (isCursed(data.wish.name || "", list)) {
      return { status: false, report: "cursed", data: { location: "name" } };
    }
    if (isCursed(data.wish.content || "", list)) {
      return { status: false, report: "cursed", data: { location: "content" } };
    }

    const doc = await getDb()
      .collection("rawEntities")
      .add({ ...data, timestamp: new Date().getTime() });

    return { status: true, report: "success", data: { id: doc.id } };
  } catch (e) {
    console.error("pushKratong failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function sendData({
  id,
  data,
}: {
  id: string;
  data: AnyResultData;
}): Promise<{ status: true; report: "success" } | { status: false; report: "invalidData" | "unexpected_error" }> {
  if (!data || !id) return { status: false, report: "invalidData" };
  try {
    await getDb().collection("filteredEntities").add(data);
    return { status: true, report: "success" };
  } catch (e) {
    console.error("sendData failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function loadFilterList({ password }: { password: string }): Promise<
  | { status: true; report: "success"; data: { raw: EntityRecord[]; archived: EntityRecord[]; display: EntityRecord[] } }
  | { status: false; report: "access_denied" | "unexpected_error" }
> {
  if (!process.env.PASSWORD || password !== process.env.PASSWORD) {
    return { status: false, report: "access_denied" };
  }
  try {
    const db = getDb();
    const read = async (name: string): Promise<EntityRecord[]> => {
      const snap = await db.collection(name).limit(20).get();
      return snap.docs.map((item) => ({ ...item.data(), id: item.id }));
    };
    const [raw, archived, display] = await Promise.all([
      read("rawEntities"),
      read("archivedEntities"),
      read("filteredEntities"),
    ]);
    return { status: true, report: "success", data: { raw, archived, display } };
  } catch (e) {
    console.error("loadFilterList failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function updateFilterList({
  password,
  id,
  type,
}: {
  password: string;
  id: string;
  type: "archive" | "display";
}): Promise<
  | { status: true; report: "success"; data: { type: "archive" | "display" } }
  | { status: false; report: "access_denied" | "unexpected_error" }
> {
  if (!process.env.PASSWORD || password !== process.env.PASSWORD) {
    return { status: false, report: "access_denied" };
  }
  try {
    const db = getDb();
    const snap = await db.collection("rawEntities").doc(id).get();
    const d = snap.data();
    if (d) {
      await db
        .collection(type === "display" ? "filteredEntities" : "archivedEntities")
        .doc(snap.id)
        .set(d);
    }
    await snap.ref.delete();
    return { status: true, report: "success", data: { type } };
  } catch (e) {
    console.error("updateFilterList failed", e);
    return { status: false, report: "unexpected_error" };
  }
}
