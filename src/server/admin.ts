"use server";

import { cookies } from "next/headers";
import type { Prisma } from "../generated/prisma/client";
import { KratongMap, normalizeSelected } from "@map/kratong";
import { prisma } from "./db";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  checkPassword,
  createSessionToken,
  isAdmin,
  isAdminConfigured,
} from "./admin-auth";

export type AdminStatus = "PENDING" | "DISPLAYED" | "ARCHIVED";
export type AdminFilter = "ALL" | AdminStatus | "PINNED";

export type AdminKratong = {
  id: string;
  kratong: unknown;
  wishName: string;
  wishContent: string;
  status: AdminStatus;
  pinned: boolean;
  pinnedAt: string | null;
  createdAt: string;
};

type Fail = { status: false; report: "unauthorized" | "invalid" | "unexpected_error" };

const STATUSES: readonly string[] = ["PENDING", "DISPLAYED", "ARCHIVED"];
const FILTERS: readonly string[] = ["ALL", ...STATUSES, "PINNED"];
const PAGE_SIZE = 30;
const MAX_IDS = 200;

const isStatus = (v: unknown): v is AdminStatus => typeof v === "string" && STATUSES.includes(v);
const isIds = (v: unknown): v is string[] =>
  Array.isArray(v) &&
  v.length > 0 &&
  v.length <= MAX_IDS &&
  v.every((x) => typeof x === "string" && x.length > 0 && x.length <= 64);

export async function adminLogin(
  formData: FormData,
): Promise<{ status: true; report: "success" } | { status: false; report: "wrong_password" | "disabled" | "invalid" }> {
  if (!isAdminConfigured()) return { status: false, report: "disabled" };
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0 || password.length > 512) {
    return { status: false, report: "invalid" };
  }
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 500));
    return { status: false, report: "wrong_password" };
  }
  const token = createSessionToken();
  if (!token) return { status: false, report: "disabled" };
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return { status: true, report: "success" };
}

export async function adminLogout(): Promise<{ status: true; report: "success" }> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return { status: true, report: "success" };
}

function toItem(r: {
  id: string;
  kratong: Prisma.JsonValue;
  wishName: string;
  wishContent: string;
  status: AdminStatus;
  pinned: boolean;
  pinnedAt: Date | null;
  createdAt: Date;
}): AdminKratong {
  return { ...r, pinnedAt: r.pinnedAt?.toISOString() ?? null, createdAt: r.createdAt.toISOString() };
}

export async function listKratongs(input: {
  status: AdminFilter;
  q?: string;
  cursor?: string;
}): Promise<{ status: true; report: "success"; data: { items: AdminKratong[]; nextCursor: string | null } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || !FILTERS.includes(input.status)) return { status: false, report: "invalid" };
  const q = typeof input.q === "string" ? input.q.trim().slice(0, 100) : "";
  if (input.cursor !== undefined && (typeof input.cursor !== "string" || input.cursor.length > 64)) {
    return { status: false, report: "invalid" };
  }
  try {
    const where: Prisma.KratongWhereInput = {};
    if (input.status === "PINNED") where.pinned = true;
    else if (input.status !== "ALL") where.status = input.status;
    if (q) {
      where.OR = [
        { wishName: { contains: q, mode: "insensitive" } },
        { wishContent: { contains: q, mode: "insensitive" } },
      ];
    }
    const rows = await prisma.kratong.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE_SIZE + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        kratong: true,
        wishName: true,
        wishContent: true,
        status: true,
        pinned: true,
        pinnedAt: true,
        createdAt: true,
      },
    });
    const hasMore = rows.length > PAGE_SIZE;
    const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    return {
      status: true,
      report: "success",
      data: { items: page.map(toItem), nextCursor: hasMore ? page[page.length - 1].id : null },
    };
  } catch (e) {
    console.error("listKratongs failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function countKratongs(): Promise<
  { status: true; report: "success"; data: Record<AdminFilter, number> } | Fail
> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  try {
    const groups = await prisma.kratong.groupBy({ by: ["status"], _count: { _all: true } });
    const data: Record<AdminFilter, number> = { ALL: 0, PENDING: 0, DISPLAYED: 0, ARCHIVED: 0, PINNED: 0 };
    data.PINNED = await prisma.kratong.count({ where: { pinned: true } });
    for (const g of groups) {
      data[g.status] = g._count._all;
      data.ALL += g._count._all;
    }
    return { status: true, report: "success", data };
  } catch (e) {
    console.error("countKratongs failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function setStatus(input: {
  ids: string[];
  status: AdminStatus;
}): Promise<
  | { status: true; report: "success"; data: { previous: { id: string; status: AdminStatus }[]; skipped: string[] } }
  | Fail
> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || !isIds(input.ids) || !isStatus(input.status)) return { status: false, report: "invalid" };
  try {
    const ids = [...new Set(input.ids)];
    const { previous, skipped } = await prisma.$transaction(async (tx) => {
      const found = await tx.kratong.findMany({
        where: { id: { in: ids } },
        select: { id: true, status: true, pinned: true },
      });
      // Pinned rows are locked: they may only stay DISPLAYED.
      const locked = input.status === "DISPLAYED" ? [] : found.filter((f) => f.pinned);
      const lockedIds = new Set(locked.map((l) => l.id));
      const before = found.filter((f) => !lockedIds.has(f.id)).map(({ id, status }) => ({ id, status }));
      await tx.kratong.updateMany({ where: { id: { in: before.map((b) => b.id) } }, data: { status: input.status } });
      return { previous: before, skipped: [...lockedIds] };
    });
    return { status: true, report: "success", data: { previous, skipped } };
  } catch (e) {
    console.error("setStatus failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

type PinState = { id: string; status: AdminStatus; pinned: boolean };

/** Pin (forces DISPLAYED) or unpin rows. Returns the previous state of every row it touched, for undo. */
export async function setPinned(input: {
  ids: string[];
  pinned: boolean;
}): Promise<{ status: true; report: "success"; data: { previous: PinState[] } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || !isIds(input.ids) || typeof input.pinned !== "boolean") return { status: false, report: "invalid" };
  try {
    const ids = [...new Set(input.ids)];
    const previous = await prisma.$transaction(async (tx) => {
      const before = await tx.kratong.findMany({
        where: { id: { in: ids } },
        select: { id: true, status: true, pinned: true },
      });
      await tx.kratong.updateMany({
        where: { id: { in: before.map((b) => b.id) } },
        data: input.pinned
          ? { pinned: true, pinnedAt: new Date(), status: "DISPLAYED" }
          : { pinned: false, pinnedAt: null },
      });
      return before;
    });
    return { status: true, report: "success", data: { previous } };
  } catch (e) {
    console.error("setPinned failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function restoreStatuses(input: {
  items: { id: string; status: AdminStatus; pinned?: boolean }[];
}): Promise<{ status: true; report: "success"; data: { restored: number } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  const items = input?.items;
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > MAX_IDS ||
    !items.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        i.id.length <= 64 &&
        isStatus(i.status) &&
        (i.pinned === undefined || typeof i.pinned === "boolean"),
    )
  ) {
    return { status: false, report: "invalid" };
  }
  try {
    // Group by (status, pinned); pinned undefined leaves the pin untouched.
    const groups = new Map<string, { status: AdminStatus; pinned?: boolean; ids: string[] }>();
    for (const i of items) {
      const key = `${i.status}:${i.pinned ?? "-"}`;
      const g = groups.get(key) ?? { status: i.status, pinned: i.pinned, ids: [] };
      g.ids.push(i.id);
      groups.set(key, g);
    }
    const results = await prisma.$transaction(
      [...groups.values()].map((g) =>
        prisma.kratong.updateMany({
          where: { id: { in: g.ids } },
          data:
            g.pinned === undefined
              ? { status: g.status }
              : g.pinned
                ? { status: g.status, pinned: true, pinnedAt: new Date() }
                : { status: g.status, pinned: false, pinnedAt: null },
        }),
      ),
    );
    return { status: true, report: "success", data: { restored: results.reduce((n, r) => n + r.count, 0) } };
  } catch (e) {
    console.error("restoreStatuses failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function deleteKratongs(input: {
  ids: string[];
}): Promise<{ status: true; report: "success"; data: { deleted: number; skipped: string[]; deletedIds: string[] } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || !isIds(input.ids)) return { status: false, report: "invalid" };
  try {
    const ids = [...new Set(input.ids)];
    const locked = await prisma.kratong.findMany({ where: { id: { in: ids }, pinned: true }, select: { id: true } });
    const lockedIds = new Set(locked.map((l) => l.id));
    const target = ids.filter((id) => !lockedIds.has(id));
    // `pinned: false` in the delete itself closes the race with a concurrent pin.
    const found = await prisma.kratong.findMany({ where: { id: { in: target }, pinned: false }, select: { id: true } });
    const { count } = await prisma.kratong.deleteMany({ where: { id: { in: found.map((f) => f.id) }, pinned: false } });
    return {
      status: true,
      report: "success",
      data: { deleted: count, skipped: [...lockedIds], deletedIds: found.map((f) => f.id) },
    };
  } catch (e) {
    console.error("deleteKratongs failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

/** Same limits as the builder (components/Kratong/create.tsx CharLimits). */
const EDIT_LIMITS = { name: 64, content: 280 } as const;

export type EditedParts = { base: string; flowers: string; candles: string };
export type EditField = "wishName" | "wishContent" | "kratong";

const hasKey = (o: object, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/**
 * Edits a kratong's name, wish and base/flower/candle. Decorations are left untouched (they are hidden
 * site-wide). Admins are trusted, so there is no profanity check. Pinned rows may be edited.
 * Returns the previous values for undo.
 */
export async function editKratong(input: {
  id: string;
  wishName: string;
  wishContent: string;
  kratong: EditedParts;
}): Promise<
  | {
      status: true;
      report: "success";
      data: { previous: { id: string; wishName: string; wishContent: string; kratong: unknown }; kratong: unknown };
    }
  | { status: false; report: "invalid"; data: { field: EditField; message: string } }
  | Fail
> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || typeof input.id !== "string" || input.id.length === 0 || input.id.length > 64) {
    return { status: false, report: "invalid" };
  }
  const bad = (field: EditField, message: string) => ({ status: false as const, report: "invalid" as const, data: { field, message } });
  if (typeof input.wishName !== "string" || typeof input.wishContent !== "string") return { status: false, report: "invalid" };
  const wishName = input.wishName.trim();
  const wishContent = input.wishContent.trim();
  if (!wishName) return bad("wishName", "โปรดกรอกชื่อ");
  if (wishName.length > EDIT_LIMITS.name) return bad("wishName", `ชื่อต้องไม่เกิน ${EDIT_LIMITS.name} ตัวอักษร`);
  if (!wishContent) return bad("wishContent", "โปรดกรอกคำอธิษฐาน");
  if (wishContent.length > EDIT_LIMITS.content) {
    return bad("wishContent", `คำอธิษฐานต้องไม่เกิน ${EDIT_LIMITS.content} ตัวอักษร`);
  }
  const k = input.kratong;
  if (
    !k ||
    typeof k.base !== "string" ||
    typeof k.flowers !== "string" ||
    typeof k.candles !== "string" ||
    !hasKey(KratongMap.base, k.base) ||
    !hasKey(KratongMap.flowers, k.flowers) ||
    !Object.values(KratongMap.candles).some((c) => c.id === k.candles)
  ) {
    return bad("kratong", "ชิ้นส่วนกระทงไม่ถูกต้อง");
  }
  try {
    const row = await prisma.kratong.findUnique({
      where: { id: input.id },
      select: { id: true, wishName: true, wishContent: true, kratong: true },
    });
    if (!row) return { status: false, report: "invalid" };
    const old = normalizeSelected((row.kratong ?? {}) as Record<string, unknown>);
    const next = { base: k.base, flowers: k.flowers, candles: k.candles, decorations: old.decorations, signVariant: old.signVariant };
    await prisma.kratong.update({
      where: { id: row.id },
      data: { wishName, wishContent, kratong: next as unknown as Prisma.InputJsonValue },
    });
    return {
      status: true,
      report: "success",
      data: {
        previous: { id: row.id, wishName: row.wishName, wishContent: row.wishContent, kratong: row.kratong },
        kratong: next,
      },
    };
  } catch (e) {
    console.error("editKratong failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

/** Undo for `editKratong`: puts back the exact previous text and (normalised) parts, whatever the limits say. */
export async function restoreEdit(input: {
  id: string;
  wishName: string;
  wishContent: string;
  kratong: unknown;
}): Promise<{ status: true; report: "success" } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (
    !input ||
    typeof input.id !== "string" ||
    input.id.length === 0 ||
    input.id.length > 64 ||
    typeof input.wishName !== "string" ||
    typeof input.wishContent !== "string" ||
    input.wishName.length > 1000 ||
    input.wishContent.length > 5000 ||
    !input.kratong ||
    typeof input.kratong !== "object" ||
    Array.isArray(input.kratong)
  ) {
    return { status: false, report: "invalid" };
  }
  try {
    const kratong = normalizeSelected(input.kratong as Record<string, unknown>);
    await prisma.kratong.update({
      where: { id: input.id },
      data: {
        wishName: input.wishName,
        wishContent: input.wishContent,
        kratong: kratong as unknown as Prisma.InputJsonValue,
      },
    });
    return { status: true, report: "success" };
  } catch (e) {
    console.error("restoreEdit failed", e);
    return { status: false, report: "unexpected_error" };
  }
}
