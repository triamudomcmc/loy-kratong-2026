"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Kratong } from "@components/Kratong/kratong";
import type { Selected } from "@components/Kratong/create";
import { EditDialog, type EditError, type EditValues } from "./edit-dialog";
import { normalizeSelected } from "@map/kratong";
import {
  adminLogout,
  countKratongs,
  deleteKratongs,
  editKratong,
  listKratongs,
  restoreEdit,
  restoreStatuses,
  setPinned,
  setStatus,
  type AdminFilter,
  type AdminKratong,
  type AdminStatus,
} from "@server/admin";

type Counts = Record<AdminFilter, number>;
type Next = { status: AdminStatus; pinned: boolean };
type Move = { item: AdminKratong; next: Next };
type Prev = { id: string; status: AdminStatus; pinned?: boolean };
type Toast = { id: number; text: string; error?: boolean; undo?: () => void };

const TABS: { key: AdminFilter; label: string }[] = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "PENDING", label: "รออนุมัติ" },
  { key: "DISPLAYED", label: "แสดงอยู่" },
  { key: "ARCHIVED", label: "ซ่อนแล้ว" },
  { key: "PINNED", label: "ปักหมุด" },
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

const LOCKED_HINT = "ปลดหมุดก่อนจึงจะซ่อนหรือลบได้";
const skippedText = (n: number) => `ข้าม ${n} รายการที่ปักหมุดอยู่`;

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
  const [confirm, setConfirm] = useState<{ ids: string[]; skipped: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<AdminKratong | null>(null);

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

  /** Apply status/pin moves locally: list, counts and selection. */
  const applyLocal = (moves: Move[]) => {
    const ids = new Set(moves.map((m) => m.item.id));
    const now = new Date().toISOString();
    const next = (m: Move): AdminKratong => ({
      ...m.item,
      ...m.next,
      pinnedAt: m.next.pinned ? (m.item.pinned ? m.item.pinnedAt : now) : null,
    });
    setItems((prev) => {
      const kept = prev.filter((i) => !ids.has(i.id));
      const back = moves
        .filter((m) => tab === "ALL" || (tab === "PINNED" ? m.next.pinned : tab === m.next.status))
        .map(next);
      return [...kept, ...back].sort(sortDesc);
    });
    setCounts((c) => {
      const n = { ...c };
      for (const m of moves) {
        if (m.item.status !== m.next.status) {
          n[m.item.status]--;
          n[m.next.status]++;
        }
        if (m.item.pinned !== m.next.pinned) n.PINNED += m.next.pinned ? 1 : -1;
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
    // Pinned rows are locked: they can't leave DISPLAYED until unpinned.
    const movable = to === "DISPLAYED" ? list : list.filter((t) => !t.pinned);
    const lockedCount = list.length - movable.length;
    if (movable.length === 0) {
      if (lockedCount > 0) showToast({ text: `${skippedText(lockedCount)} ปลดหมุดก่อน`, error: true });
      return;
    }
    const snap = { ...state.current };
    applyLocal(movable.map((item) => ({ item, next: { status: to, pinned: item.pinned } })));
    const res = await setStatus({ ids: movable.map((t) => t.id), status: to });
    if (!res.status) {
      rollback(snap);
      if (res.report === "unauthorized") return unauthorized();
      return showToast({ text: "ทำรายการไม่สำเร็จ ย้อนกลับแล้ว", error: true });
    }
    const prev = res.data.previous;
    const serverSkipped = res.data.skipped.length;
    if (serverSkipped > 0) refresh(); // server saw pins the page did not know about
    const byId = new Map(movable.map((l) => [l.id, l]));
    const skipped = lockedCount + serverSkipped;
    showToast({
      text: `${prev.length} รายการ${DONE_LABEL[to]}${skipped ? ` (${skippedText(skipped)})` : ""}`,
      undo: prev.length ? () => void undo(prev, byId, { status: to }) : undefined,
    });
  };

  const pin = async (targets: AdminKratong[], pinned: boolean) => {
    const list = targets.filter((t) => t.pinned !== pinned);
    if (list.length === 0) return;
    const snap = { ...state.current };
    applyLocal(list.map((item) => ({ item, next: { status: pinned ? "DISPLAYED" : item.status, pinned } })));
    const res = await setPinned({ ids: list.map((t) => t.id), pinned });
    if (!res.status) {
      rollback(snap);
      if (res.report === "unauthorized") return unauthorized();
      return showToast({ text: "ทำรายการไม่สำเร็จ ย้อนกลับแล้ว", error: true });
    }
    const prev = res.data.previous;
    const byId = new Map(list.map((l) => [l.id, l]));
    showToast({
      text: `${prev.length} รายการ${pinned ? "ปักหมุดแล้ว (แสดงบนแม่น้ำเสมอ)" : "เลิกปักหมุดแล้ว"}`,
      undo: () => void undo(prev, byId, pinned ? { status: "DISPLAYED", pinned: true } : { pinned: false }),
    });
  };

  /** `after` is what the undone action changed on top of each item's original state. */
  const undo = async (prev: Prev[], byId: Map<string, AdminKratong>, after: Partial<Next>) => {
    setToast(null);
    clearTimeout(toastTimer.current);
    const snap = { ...state.current };
    const moves: Move[] = [];
    for (const p of prev) {
      const orig = byId.get(p.id);
      if (!orig) continue;
      const item = { ...orig, ...after };
      moves.push({ item, next: { status: p.status, pinned: p.pinned ?? item.pinned } });
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

  /** Opens the delete confirm for the unpinned targets; pinned ones are skipped up front. */
  const askDelete = (targets: AdminKratong[]) => {
    const ids = targets.filter((t) => !t.pinned).map((t) => t.id);
    const skipped = targets.length - ids.length;
    if (ids.length === 0) return showToast({ text: `${skippedText(skipped)} ${LOCKED_HINT}`, error: true });
    setConfirm({ ids, skipped });
  };

  const doDelete = async () => {
    if (!confirm) return;
    const { ids, skipped } = confirm;
    setBusy(true);
    const res = await deleteKratongs({ ids });
    setBusy(false);
    setConfirm(null);
    if (!res.status) {
      if (res.report === "unauthorized") return unauthorized();
      return showToast({ text: "ลบไม่สำเร็จ", error: true });
    }
    const gone = new Set(res.data.deletedIds);
    const removed = state.current.items.filter((i) => gone.has(i.id));
    setItems((prev) => prev.filter((i) => !gone.has(i.id)));
    setSelected((s) => new Set([...s].filter((id) => !gone.has(id))));
    setCounts((c) => {
      const n = { ...c };
      for (const r of removed) {
        n[r.status]--;
        n.ALL--;
        if (r.pinned) n.PINNED--;
      }
      return n;
    });
    const skippedAll = skipped + res.data.skipped.length;
    showToast({
      text: `ลบถาวร ${res.data.deleted} รายการแล้ว${skippedAll ? ` (${skippedText(skippedAll)})` : ""}`,
    });
    void refreshCounts();
  };

  const doEdit = async (target: AdminKratong, v: EditValues): Promise<EditError | null> => {
    const snap = { ...state.current };
    const old = normalizeSelected(target.kratong as Record<string, unknown>);
    const nextKratong = { ...old, ...v.kratong };
    const patch = (fields: Pick<AdminKratong, "wishName" | "wishContent" | "kratong">) =>
      setItems((prev) => prev.map((i) => (i.id === target.id ? { ...i, ...fields } : i)));
    patch({ wishName: v.wishName, wishContent: v.wishContent, kratong: nextKratong });
    const res = await editKratong({ id: target.id, ...v });
    if (!res.status) {
      rollback(snap);
      if ("data" in res && res.data) return res.data;
      if (res.report === "unauthorized") unauthorized();
      else showToast({ text: "แก้ไขไม่สำเร็จ ย้อนกลับแล้ว", error: true });
      setEditing(null);
      return null;
    }
    setEditing(null);
    const prev = res.data.previous;
    showToast({
      text: "แก้ไขแล้ว",
      undo: () => {
        setToast(null);
        clearTimeout(toastTimer.current);
        const before = { ...state.current };
        patch({ wishName: prev.wishName, wishContent: prev.wishContent, kratong: prev.kratong });
        void restoreEdit(prev).then((r) => {
          if (r.status) return showToast({ text: "เลิกทำแล้ว" });
          rollback(before);
          if (r.report === "unauthorized") unauthorized();
          else showToast({ text: "เลิกทำไม่สำเร็จ", error: true });
        });
      },
    });
    return null;
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
            onPin={(p) => void pin([it], p)}
            onEdit={() => setEditing(it)}
            onDelete={() => askDelete([it])}
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
            <button className={btn("pin")} onClick={() => void pin(picked, true)}>
              ปักหมุด
            </button>
            <button className={btn("outline")} onClick={() => void pin(picked, false)}>
              เลิกปักหมุด
            </button>
            <button className={btn("primary")} onClick={() => void change(picked, "DISPLAYED")}>
              อนุมัติ
            </button>
            <button className={btn("outline")} onClick={() => void change(picked, "ARCHIVED")}>
              ซ่อน
            </button>
            <button className={btn("outline")} onClick={() => void change(picked, "PENDING")}>
              กลับไปรออนุมัติ
            </button>
            <button className={clsx(btn("ghost"), "text-red-700 hover:bg-red-50")} onClick={() => askDelete(picked)}>
              ลบถาวร
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

      {editing && (
        <EditDialog item={editing} onClose={() => setEditing(null)} onSave={(v) => doEdit(editing, v)} />
      )}

      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ยืนยันการลบถาวร"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-medium">ลบถาวร {confirm.ids.length} รายการ?</h2>
            <p className="mt-2 text-sm text-slate-600">การลบนี้ไม่สามารถเลิกทำได้ ข้อมูลจะหายไปจากระบบทันที</p>
            {confirm.skipped > 0 && (
              <p className="mt-2 text-sm text-amber-800">{skippedText(confirm.skipped)} (ไม่ถูกลบ)</p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button className={btn("outline")} disabled={busy} onClick={() => setConfirm(null)}>
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

function btn(kind: "primary" | "outline" | "ghost" | "danger" | "pin") {
  return clsx(
    "h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-60",
    kind === "primary" && "bg-[#004b64] text-white hover:bg-[#003a4e]",
    kind === "outline" && "border border-slate-300 bg-white text-slate-800 hover:border-[#1286b1]",
    kind === "ghost" && "text-slate-600 hover:bg-slate-100",
    kind === "pin" && "bg-amber-500 text-white hover:bg-amber-600",
    kind === "danger" && "bg-red-600 text-white hover:bg-red-700",
  );
}

function Card({
  item,
  checked,
  onToggle,
  onChange,
  onPin,
  onEdit,
  onDelete,
}: {
  item: AdminKratong;
  checked: boolean;
  onToggle: () => void;
  onChange: (to: AdminStatus) => void;
  onPin: (pinned: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const badge = BADGE[item.status];
  return (
    <li
      data-id={item.id}
      className={clsx(
        "flex gap-3 rounded-2xl border bg-white p-3",
        checked
          ? "border-[#1286b1] ring-2 ring-[#4ed1d8]/50"
          : item.pinned
            ? "border-amber-400 bg-amber-50/40"
            : "border-slate-200",
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
          <span className="flex shrink-0 flex-wrap justify-end gap-1">
            {item.pinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                <PinIcon />
                ปักหมุด
              </span>
            )}
            <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", badge.cls)}>{badge.label}</span>
          </span>
        </div>
        <p className="font-noto whitespace-pre-wrap break-words text-sm text-slate-700">{item.wishContent || "-"}</p>
        <p className="text-xs text-slate-500">{fmt.format(new Date(item.createdAt))}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button className={btn("outline")} onClick={onEdit}>
            แก้ไข
          </button>
          {item.pinned ? (
            <>
              <button className={btn("outline")} onClick={() => onPin(false)}>
                เลิกปักหมุด
              </button>
              <button className={btn("outline")} disabled title={LOCKED_HINT}>
                ซ่อน
              </button>
              <button className={btn("outline")} disabled title={LOCKED_HINT}>
                กลับไปรออนุมัติ
              </button>
              <button className={clsx(btn("ghost"), "text-red-700")} disabled title={LOCKED_HINT}>
                ลบถาวร
              </button>
            </>
          ) : (
            <>
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
              <button className={btn("pin")} onClick={() => onPin(true)}>
                ปักหมุด
              </button>
              <button className={clsx(btn("ghost"), "text-red-700 hover:bg-red-50")} onClick={onDelete}>
                ลบถาวร
              </button>
            </>
          )}
        </div>
        {item.pinned && <p className="text-xs text-amber-800">{LOCKED_HINT}</p>}
      </div>
    </li>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
      <path d="M16 3a1 1 0 0 1 .7 1.7L15.4 6l1.6 5.2c1.2.8 2 1.9 2 3.3a1 1 0 0 1-1 1h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 0 1-1-1c0-1.4.8-2.5 2-3.3L8.6 6 7.3 4.7A1 1 0 0 1 8 3h8Z" />
    </svg>
  );
}
