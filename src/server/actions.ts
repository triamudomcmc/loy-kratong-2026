"use server";

import type { AnyResultData } from "@types-app/kratong";
import type { Prisma, Kratong } from "../generated/prisma/client";
import { prisma } from "./db";
import { isCursed, loadBlocklist } from "./profanity";

export type EntityRecord = Record<string, unknown> & { id: string };

function toRecord(row: Kratong): EntityRecord {
  return {
    id: row.id,
    kratong: row.kratong,
    wish: { name: row.wishName, content: row.wishContent },
    timestamp: row.createdAt.getTime(),
  };
}

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

    const row = await prisma.kratong.create({
      data: {
        kind: "STANDARD",
        status: "PENDING",
        kratong: data.kratong as unknown as Prisma.InputJsonValue,
        wishName: data.wish.name ?? "",
        wishContent: data.wish.content ?? "",
      },
    });

    return { status: true, report: "success", data: { id: row.id } };
  } catch (e) {
    console.error("pushKratong failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function sendData({
  id,
  data,
  kind,
}: {
  id: string;
  data: AnyResultData;
  kind: "PRINCIPAL" | "CUPSAA";
}): Promise<{ status: true; report: "success" } | { status: false; report: "invalidData" | "unexpected_error" }> {
  if (!data || !id) return { status: false, report: "invalidData" };
  try {
    // Upsert on the invite id so client retries / refreshes never create duplicates.
    const fields = {
      kind,
      status: "DISPLAYED" as const,
      kratong: data.kratong as unknown as Prisma.InputJsonValue,
      wishName: data.wish?.name ?? "",
      wishContent: data.wish?.content ?? "",
    };
    await prisma.kratong.upsert({
      where: { sourceId: id },
      create: { ...fields, sourceId: id },
      update: fields,
    });
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
    const read = async (status: "PENDING" | "ARCHIVED" | "DISPLAYED"): Promise<EntityRecord[]> => {
      const rows = await prisma.kratong.findMany({ where: { status }, orderBy: { createdAt: "asc" }, take: 20 });
      return rows.map(toRecord);
    };
    const [raw, archived, display] = await Promise.all([read("PENDING"), read("ARCHIVED"), read("DISPLAYED")]);
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
    const { count } = await prisma.kratong.updateMany({
      where: { id, status: "PENDING" },
      data: { status: type === "display" ? "DISPLAYED" : "ARCHIVED" },
    });
    if (count === 0) return { status: false, report: "unexpected_error" };
    return { status: true, report: "success", data: { type } };
  } catch (e) {
    console.error("updateFilterList failed", e);
    return { status: false, report: "unexpected_error" };
  }
}
