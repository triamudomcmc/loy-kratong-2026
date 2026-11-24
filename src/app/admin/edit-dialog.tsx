"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Kratong } from "@components/Kratong/kratong";
import type { Selected } from "@components/Kratong/create";
import { KratongMap, normalizeSelected } from "@map/kratong";
import type { AdminKratong } from "@server/admin";

// Same limits as the builder (components/Kratong/create.tsx) and `editKratong`.
const LIMITS = { name: 64, content: 280 };

export type EditValues = { wishName: string; wishContent: string; kratong: { base: string; flowers: string; candles: string } };
export type EditError = { field: "wishName" | "wishContent" | "kratong"; message: string };

type Option = { id: string; name: string; thumb: string };

const BASES: Option[] = Object.values(KratongMap.base).map((p) => ({ id: p.id, name: p.name, thumb: p.thumbnail ?? p.url }));
const FLOWERS: Option[] = Object.values(KratongMap.flowers).map((p) => ({ id: p.id, name: p.name, thumb: p.thumbnail ?? p.url }));
const CANDLES: Option[] = Object.values(KratongMap.candles).map((p) => ({ id: p.id, name: p.name, thumb: p.thumbnail ?? p.url }));

export function EditDialog({
  item,
  onClose,
  onSave,
}: {
  item: AdminKratong;
  onClose: () => void;
  onSave: (values: EditValues) => Promise<EditError | null>;
}) {
  const start = normalizeSelected(item.kratong as Record<string, unknown>);
  const [name, setName] = useState(item.wishName);
  const [content, setContent] = useState(item.wishContent);
  const [parts, setParts] = useState({ base: start.base as string, flowers: start.flowers as string, candles: start.candles });
  const [error, setError] = useState<EditError | null>(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // focus the name field on open; give focus back to whatever opened the dialog on close
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, []);

  const nameLen = name.trim().length;
  const contentLen = content.trim().length;
  const local: EditError | null =
    nameLen === 0
      ? { field: "wishName", message: "โปรดกรอกชื่อ" }
      : nameLen > LIMITS.name
        ? { field: "wishName", message: `ชื่อต้องไม่เกิน ${LIMITS.name} ตัวอักษร` }
        : contentLen === 0
          ? { field: "wishContent", message: "โปรดกรอกคำอธิษฐาน" }
          : contentLen > LIMITS.content
            ? { field: "wishContent", message: `คำอธิษฐานต้องไม่เกิน ${LIMITS.content} ตัวอักษร` }
            : null;
  const shown = error;
  const fieldError = (f: EditError["field"]) => (shown?.field === f ? shown.message : null);

  const submit = async () => {
    if (local) {
      setError(local);
      return;
    }
    setSaving(true);
    const res = await onSave({ wishName: name.trim(), wishContent: content.trim(), kratong: parts });
    setSaving(false);
    if (res) setError(res);
  };

  const preview = { ...start, ...parts } as Selected;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="แก้ไขกระทง"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:px-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3">
          <h2 className="text-lg font-medium text-[#004b64]">แก้ไขกระทง</h2>
          <div className="rounded-xl bg-gradient-to-b from-[#4ed1d8] to-[#1286b1] p-2">
            <Kratong selected={preview} height="56px" zIndex={1} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <Field label="ชื่อ" count={nameLen} max={LIMITS.name} error={fieldError("wishName")}>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              aria-invalid={!!fieldError("wishName")}
              className={inputCls(!!fieldError("wishName"))}
            />
          </Field>
          <Field label="คำอธิษฐาน" count={contentLen} max={LIMITS.content} error={fieldError("wishContent")}>
            <textarea
              value={content}
              rows={4}
              onChange={(e) => {
                setContent(e.target.value);
                setError(null);
              }}
              aria-invalid={!!fieldError("wishContent")}
              className={clsx(inputCls(!!fieldError("wishContent")), "h-auto resize-y py-2")}
            />
          </Field>

          <Picker label="ฐานกระทง" options={BASES} value={parts.base} onChange={(base) => setParts({ ...parts, base })} />
          <Picker label="ดอกไม้" options={FLOWERS} value={parts.flowers} onChange={(flowers) => setParts({ ...parts, flowers })} />
          <Picker label="เทียน" options={CANDLES} value={parts.candles} onChange={(candles) => setParts({ ...parts, candles })} />
          {fieldError("kratong") && <p className="mt-2 text-sm text-red-700">{fieldError("kratong")}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button className={footBtn("outline")} disabled={saving} onClick={onClose}>
            ยกเลิก
          </button>
          <button className={footBtn("primary")} disabled={saving} onClick={() => void submit()}>
            {saving ? "กำลังบันทึก…" : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}

function inputCls(bad: boolean) {
  return clsx(
    "w-full rounded-lg border px-3 text-base outline-none focus:ring-2",
    "h-11",
    bad ? "border-red-500 focus:ring-red-200" : "border-slate-300 focus:border-[#1286b1] focus:ring-[#4ed1d8]/50",
  );
}

function footBtn(kind: "primary" | "outline") {
  return clsx(
    "h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-60",
    kind === "primary" ? "bg-[#004b64] text-white hover:bg-[#003a4e]" : "border border-slate-300 bg-white text-slate-800 hover:border-[#1286b1]",
  );
}

function Field({
  label,
  count,
  max,
  error,
  children,
}: {
  label: string;
  count: number;
  max: number;
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 flex items-baseline justify-between text-sm font-medium">
        {label}
        <span className={clsx("text-xs tabular-nums", count > max ? "text-red-700" : "text-slate-500")}>
          {count}/{max}
        </span>
      </span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
    </label>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <fieldset className="mb-3">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            title={o.name}
            aria-label={o.name}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={clsx(
              "flex size-14 items-center justify-center rounded-xl border bg-slate-50 p-1 transition",
              value === o.id ? "border-[#004b64] ring-2 ring-[#4ed1d8]/60" : "border-slate-200 hover:border-[#1286b1]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.thumb} alt="" draggable={false} className="max-h-full max-w-full object-contain" />
          </button>
        ))}
      </div>
    </fieldset>
  );
}
