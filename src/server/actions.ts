"use server";

import type { AnyResultData } from "@types-app/kratong";
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "./db";
import { isCursed, loadBlocklist } from "./profanity";

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
