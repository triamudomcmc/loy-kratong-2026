"use server";

import { cookies } from "next/headers";
import type { Prisma } from "../generated/prisma/client";
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
export type AdminFilter = "ALL" | AdminStatus;

export type AdminKratong = {
  id: string;
  kratong: unknown;
  wishName: string;
  wishContent: string;
  status: AdminStatus;
  createdAt: string;
};

type Fail = { status: false; report: "unauthorized" | "invalid" | "unexpected_error" };

const STATUSES: readonly string[] = ["PENDING", "DISPLAYED", "ARCHIVED"];
const FILTERS: readonly string[] = ["ALL", ...STATUSES];
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
  createdAt: Date;
}): AdminKratong {
  return { ...r, createdAt: r.createdAt.toISOString() };
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
    if (input.status !== "ALL") where.status = input.status;
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
      select: { id: true, kratong: true, wishName: true, wishContent: true, status: true, createdAt: true },
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
    const data: Record<AdminFilter, number> = { ALL: 0, PENDING: 0, DISPLAYED: 0, ARCHIVED: 0 };
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
}): Promise<{ status: true; report: "success"; data: { previous: { id: string; status: AdminStatus }[] } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || !isIds(input.ids) || !isStatus(input.status)) return { status: false, report: "invalid" };
  try {
    const ids = [...new Set(input.ids)];
    const previous = await prisma.$transaction(async (tx) => {
      const before = await tx.kratong.findMany({ where: { id: { in: ids } }, select: { id: true, status: true } });
      await tx.kratong.updateMany({ where: { id: { in: before.map((b) => b.id) } }, data: { status: input.status } });
      return before;
    });
    return { status: true, report: "success", data: { previous } };
  } catch (e) {
    console.error("setStatus failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function restoreStatuses(input: {
  items: { id: string; status: AdminStatus }[];
}): Promise<{ status: true; report: "success"; data: { restored: number } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  const items = input?.items;
  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > MAX_IDS ||
    !items.every((i) => i && typeof i.id === "string" && i.id.length <= 64 && isStatus(i.status))
  ) {
    return { status: false, report: "invalid" };
  }
  try {
    const byStatus = new Map<AdminStatus, string[]>();
    for (const i of items) byStatus.set(i.status, [...(byStatus.get(i.status) ?? []), i.id]);
    const results = await prisma.$transaction(
      [...byStatus].map(([status, ids]) => prisma.kratong.updateMany({ where: { id: { in: ids } }, data: { status } })),
    );
    return { status: true, report: "success", data: { restored: results.reduce((n, r) => n + r.count, 0) } };
  } catch (e) {
    console.error("restoreStatuses failed", e);
    return { status: false, report: "unexpected_error" };
  }
}

export async function deleteKratongs(input: {
  ids: string[];
}): Promise<{ status: true; report: "success"; data: { deleted: number } } | Fail> {
  if (!(await isAdmin())) return { status: false, report: "unauthorized" };
  if (!input || !isIds(input.ids)) return { status: false, report: "invalid" };
  try {
    const { count } = await prisma.kratong.deleteMany({ where: { id: { in: [...new Set(input.ids)] } } });
    return { status: true, report: "success", data: { deleted: count } };
  } catch (e) {
    console.error("deleteKratongs failed", e);
    return { status: false, report: "unexpected_error" };
  }
}
