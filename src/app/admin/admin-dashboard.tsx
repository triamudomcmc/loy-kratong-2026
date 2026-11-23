"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Kratong } from "@components/Kratong/kratong";
import type { Selected } from "@components/Kratong/create";
import {
  adminLogout,
  countKratongs,
  deleteKratongs,
  listKratongs,
  restoreStatuses,
  setStatus,
  type AdminFilter,
  type AdminKratong,
  type AdminStatus,
} from "@server/admin";

type Counts = Record<AdminFilter, number>;
type Move = { item: AdminKratong; to: AdminStatus };
type Toast = { id: number; text: string; error?: boolean; undo?: () => void };

const TABS: { key: AdminFilter; label: string }[] = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "PENDING", label: "รออนุมัติ" },
  { key: "DISPLAYED", label: "แสดงอยู่" },
  { key: "ARCHIVED", label: "ซ่อนแล้ว" },
];

const BADGE: Record<AdminStatus, { label: string; cls: string }> = {
  PENDING: { label: "รออนุมัติ", cls: "bg-amber-100 text-amber-900" },
  DISPLAYED: { label: "แสดงอยู่", cls: "bg-emerald-100 text-emerald-900" },
  ARCHIVED: { label: "ซ่อนแล้ว", cls: "bg-slate-200 text-slate-700" },
};

const DONE_LABEL: Record<AdminStatus, string> = {
  PENDING: "ย้ายกลับไปรออนุมัติ",
  DISPLAYED: "แสดงแล้ว",
  ARCHIVED: "ซ่อนแล้ว",
};

const fmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

const sortDesc = (a: AdminKratong, b: AdminKratong) =>
  a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : a.id < b.id ? 1 : -1;

export function AdminDashboard({
  initialItems,
  initialCursor,
  initialCounts,
}: {
  initialItems: AdminKratong[];
  initialCursor: string | null;
  initialCounts: Counts;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminFilter>("ALL");
  const [q, setQ] = useState("");
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [counts, setCounts] = useState(initialCounts);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);

  const reqId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const view = useRef({ tab, q });
  const state = useRef({ items, counts });
  useEffect(() => {
    view.current = { tab, q };
    state.current = { items, counts };
  });

  const showToast = useCallback((t: Omit<Toast, "id">) => {
    clearTimeout(toastTimer.current);
    setToast({ ...t, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }, []);

  const unauthorized = useCallback(() => router.refresh(), [router]);

  const refreshCounts = useCallback(async () => {
    const res = await countKratongs();
    if (res.status) setCounts(res.data);
    else if (res.report === "unauthorized") unauthorized();
  }, [unauthorized]);

  const load = useCallback(
    async (nextTab: AdminFilter, nextQ: string, after?: string) => {
      const id = ++reqId.current;
      setLoading(true);
      const res = await listKratongs({ status: nextTab, q: nextQ, cursor: after });
      if (id !== reqId.current) return;
      setLoading(false);
      if (!res.status) {
        if (res.report === "unauthorized") unauthorized();
        else showToast({ text: "โหลดข้อมูลไม่สำเร็จ", error: true });
        return;
      }
      setItems((prev) => {
        if (!after) return res.data.items;
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.data.items.filter((i) => !seen.has(i.id))];
      });
      setCursor(res.data.nextCursor);
    },
    [showToast, unauthorized],
  );

  useEffect(() => {
    const onFocus = () => void refreshCounts();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshCounts]);

  const changeTab = (t: AdminFilter) => {
    if (t === tab) return;
    setTab(t);
    setSelected(new Set());
    void load(t, q);
  };

  const onSearch = (v: string) => {
    setQ(v);
    setSelected(new Set());
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => void load(view.current.tab, v.trim()), 300);
  };

  const refresh = () => {
    void refreshCounts();
    void load(tab, q.trim());
  };

  /** Apply status moves locally: list, counts and selection. */
  const applyLocal = (moves: Move[]) => {
    const ids = new Set(moves.map((m) => m.item.id));
    setItems((prev) => {
      const kept = prev.filter((i) => !ids.has(i.id));
      const back = moves
        .filter((m) => tab === "ALL" || tab === m.to)
        .map((m) => ({ ...m.item, status: m.to }));
      return [...kept, ...back].sort(sortDesc);
    });
    setCounts((c) => {
      const n = { ...c };
      for (const m of moves) {
        if (m.item.status === m.to) continue;
        n[m.item.status]--;
        n[m.to]++;
      }
      return n;
    });
    setSelected((s) => {
      const n = new Set(s);
      for (const id of ids) n.delete(id);
      return n;
    });
  };

  const rollback = (snap: { items: AdminKratong[]; counts: Counts }) => {
    setItems(snap.items);
    setCounts(snap.counts);
  };

  const change = async (targets: AdminKratong[], to: AdminStatus) => {
    const list = targets.filter((t) => t.status !== to);
    if (list.length === 0) return;
    const snap = { ...state.current };
    applyLocal(list.map((item) => ({ item, to })));
    const res = await setStatus({ ids: list.map((t) => t.id), status: to });
    if (!res.status) {
      rollback(snap);
      if (res.report === "unauthorized") return unauthorized();
      return showToast({ text: "ทำรายการไม่สำเร็จ ย้อนกลับแล้ว", error: true });
    }
    const prev = res.data.previous;
    const byId = new Map(list.map((l) => [l.id, l]));
    showToast({
      text: `${prev.length} รายการ${DONE_LABEL[to]}`,
      undo: () => void undo(prev, byId, to),
    });
  };

  const undo = async (prev: { id: string; status: AdminStatus }[], byId: Map<string, AdminKratong>, from: AdminStatus) => {
    setToast(null);
    clearTimeout(toastTimer.current);
    const snap = { ...state.current };
    const moves: Move[] = [];
    for (const p of prev) {
      const item = byId.get(p.id);
      if (item) moves.push({ item: { ...item, status: from }, to: p.status });
    }
    applyLocal(moves);
    const res = await restoreStatuses({ items: prev });
    if (!res.status) {
      rollback(snap);
      if (res.report === "unauthorized") return unauthorized();
      return showToast({ text: "เลิกทำไม่สำเร็จ", error: true });
    }
    showToast({ text: `เลิกทำแล้ว ${res.data.restored} รายการ` });
  };

  const doDelete = async () => {
    if (!confirmIds) return;
    const ids = confirmIds;
    setBusy(true);
    const res = await deleteKratongs({ ids });
    setBusy(false);
    setConfirmIds(null);
    if (!res.status) {
      if (res.report === "unauthorized") return unauthorized();
      return showToast({ text: "ลบไม่สำเร็จ", error: true });
    }
    const gone = new Set(ids);
    const removed = state.current.items.filter((i) => gone.has(i.id));
    setItems((prev) => prev.filter((i) => !gone.has(i.id)));
    setSelected((s) => new Set([...s].filter((id) => !gone.has(id))));
    setCounts((c) => {
      const n = { ...c };
      for (const r of removed) {
        n[r.status]--;
        n.ALL--;
      }
      return n;
    });
    showToast({ text: `ลบถาวร ${res.data.deleted} รายการแล้ว` });
    void refreshCounts();
  };

  const logout = async () => {
    await adminLogout();
    router.refresh();
  };

  const allSelected = items.length > 0 && items.every((i) => selected.has(i.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const picked = items.filter((i) => selected.has(i.id));

  return (
    <main data-scene="plain" className="font-ui mx-auto min-h-dvh max-w-5xl px-4 pb-28 pt-4 text-[#1f2a30]">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium text-[#004b64]">ตรวจสอบระบบ</h1>
        <div className="flex gap-2">
          <button onClick={refresh} className={btn("ghost")} aria-label="รีเฟรช">
            รีเฟรช
          </button>
          <button onClick={logout} className={btn("ghost")}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <div role="tablist" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => changeTab(t.key)}
            className={clsx(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
              tab === t.key
                ? "border-[#004b64] bg-[#004b64] text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-[#1286b1]",
            )}
          >
            {t.label}
            <span
              data-testid={`count-${t.key}`}
              className={clsx(
                "rounded-full px-2 text-xs tabular-nums",
                tab === t.key ? "bg-white/20" : "bg-slate-100",
              )}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ค้นหาชื่อหรือคำอธิษฐาน"
          aria-label="ค้นหา"
          className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-base outline-none focus:border-[#1286b1] focus:ring-2 focus:ring-[#4ed1d8]/50"
        />
        <label className="flex shrink-0 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allSelected}
            disabled={items.length === 0}
            onChange={() => setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))}
            className="size-5 accent-[#004b64]"
          />
          เลือกทั้งหน้า
        </label>
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((it) => (
          <Card
            key={it.id}
            item={it}
            checked={selected.has(it.id)}
            onToggle={() => toggle(it.id)}
            onChange={(to) => void change([it], to)}
            onDelete={() => setConfirmIds([it.id])}
          />
        ))}
      </ul>

      {items.length === 0 && !loading && (
        <p className="mt-10 text-center text-slate-500">{q ? "ไม่พบรายการที่ค้นหา" : "ไม่มีรายการ"}</p>
      )}
      {loading && <p className="mt-6 text-center text-sm text-slate-500">กำลังโหลด…</p>}
      {cursor && !loading && (
        <div className="mt-5 text-center">
          <button onClick={() => void load(tab, q.trim(), cursor)} className={btn("outline")}>
            โหลดเพิ่ม
          </button>
        </div>
      )}

      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
            <span className="mr-auto text-sm font-medium">เลือก {picked.length} รายการ</span>
            <button className={btn("primary")} onClick={() => void change(picked, "DISPLAYED")}>
              อนุมัติ
            </button>
            <button className={btn("outline")} onClick={() => void change(picked, "ARCHIVED")}>
              ซ่อน
            </button>
            <button className={btn("outline")} onClick={() => void change(picked, "PENDING")}>
              กลับไปรออนุมัติ
            </button>
            <button className={btn("ghost")} onClick={() => setSelected(new Set())}>
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={clsx(
            "fixed left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm text-white shadow-lg",
            picked.length > 0 ? "bottom-24" : "bottom-5",
            toast.error ? "bg-red-700" : "bg-[#0b2a35]",
          )}
        >
          <span>{toast.text}</span>
          {toast.undo && (
            <button onClick={toast.undo} className="shrink-0 font-medium text-[#4ed1d8] underline underline-offset-2">
              เลิกทำ
            </button>
          )}
        </div>
      )}

      {confirmIds && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ยืนยันการลบถาวร"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-medium">ลบถาวร {confirmIds.length} รายการ?</h2>
            <p className="mt-2 text-sm text-slate-600">การลบนี้ไม่สามารถเลิกทำได้ ข้อมูลจะหายไปจากระบบทันที</p>
            <div className="mt-5 flex justify-end gap-2">
              <button className={btn("outline")} disabled={busy} onClick={() => setConfirmIds(null)}>
                ยกเลิก
              </button>
              <button className={btn("danger")} disabled={busy} onClick={() => void doDelete()}>
                {busy ? "กำลังลบ…" : "ลบถาวร"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function btn(kind: "primary" | "outline" | "ghost" | "danger") {
  return clsx(
    "h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-60",
    kind === "primary" && "bg-[#004b64] text-white hover:bg-[#003a4e]",
    kind === "outline" && "border border-slate-300 bg-white text-slate-800 hover:border-[#1286b1]",
    kind === "ghost" && "text-slate-600 hover:bg-slate-100",
    kind === "danger" && "bg-red-600 text-white hover:bg-red-700",
  );
}

function Card({
  item,
  checked,
  onToggle,
  onChange,
  onDelete,
}: {
  item: AdminKratong;
  checked: boolean;
  onToggle: () => void;
  onChange: (to: AdminStatus) => void;
  onDelete: () => void;
}) {
  const badge = BADGE[item.status];
  return (
    <li
      data-id={item.id}
      className={clsx(
        "flex gap-3 rounded-2xl border bg-white p-3",
        checked ? "border-[#1286b1] ring-2 ring-[#4ed1d8]/50" : "border-slate-200",
      )}
    >
      <div className="flex shrink-0 flex-col items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label="เลือก"
          className="size-5 accent-[#004b64]"
        />
        <div className="rounded-xl bg-gradient-to-b from-[#4ed1d8] to-[#1286b1] p-2">
          <Kratong selected={item.kratong as Selected} height="64px" zIndex={1} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-noto min-w-0 break-words font-bold">{item.wishName || "(ไม่ระบุชื่อ)"}</p>
          <span className={clsx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", badge.cls)}>
            {badge.label}
          </span>
        </div>
        <p className="font-noto whitespace-pre-wrap break-words text-sm text-slate-700">{item.wishContent || "-"}</p>
        <p className="text-xs text-slate-500">{fmt.format(new Date(item.createdAt))}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {item.status === "PENDING" && (
            <>
              <button className={btn("primary")} onClick={() => onChange("DISPLAYED")}>
                อนุมัติ
              </button>
              <button className={btn("outline")} onClick={() => onChange("ARCHIVED")}>
                ซ่อน
              </button>
            </>
          )}
          {item.status === "DISPLAYED" && (
            <>
              <button className={btn("outline")} onClick={() => onChange("ARCHIVED")}>
                ซ่อน
              </button>
              <button className={btn("outline")} onClick={() => onChange("PENDING")}>
                กลับไปรออนุมัติ
              </button>
            </>
          )}
          {item.status === "ARCHIVED" && (
            <>
              <button className={btn("primary")} onClick={() => onChange("DISPLAYED")}>
                กู้คืนแสดง
              </button>
              <button className={btn("outline")} onClick={() => onChange("PENDING")}>
                กลับไปรออนุมัติ
              </button>
            </>
          )}
          <button className={clsx(btn("ghost"), "text-red-700 hover:bg-red-50")} onClick={onDelete}>
            ลบถาวร
          </button>
        </div>
      </div>
    </li>
  );
}
