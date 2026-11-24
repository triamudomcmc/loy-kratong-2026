"use client";

import type { FC } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Frame, Layer, u } from "@components/ui";
import type { ResultData } from "@types-app/kratong";

export type CaptureStyle = "day" | "night";

export const captureUrl = (entity: ResultData, style: CaptureStyle = "day") =>
  `/api/capture?data=${encodeURIComponent(JSON.stringify(entity))}&style=${style}`;

/** Animated preview: the same page as the share image, played as a one-shot reveal. */
const previewUrl = (entity: ResultData, style: CaptureStyle) =>
  `/capture?animate=1&style=${style}&data=${encodeURIComponent(JSON.stringify(entity))}`;

/** /capture is designed at 431x812 (--u = 100vh / 812). */
const CAPTURE_W = 431;
const CAPTURE_H = 812;

const STYLES: { id: CaptureStyle; label: string }[] = [
  { id: "day", label: "กลางวัน" },
  { id: "night", label: "กลางคืน" },
];

/** Downloads the share image; in-app browsers (LINE, Messenger, Facebook) cannot save blob URLs, so they get the plain link. */
export async function downloadCapture(imgUrl: string): Promise<boolean> {
  const res = await fetch(imgUrl, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" });
  if (!res.ok) return false;

  const { default: InApp } = await import("detect-inapp");
  const inapp = new InApp(navigator.userAgent || navigator.vendor);
  const a = document.createElement("a");
  if (inapp.browser === "line" || inapp.browser === "messenger" || inapp.browser === "facebook") {
    a.href = imgUrl;
  } else {
    a.href = window.URL.createObjectURL(await res.blob());
  }
  a.download = `loykratong.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}

/** Snap modal (Figma Snap 91:1096): glass card with the real share image and a "บันทึก" download button. */
export const SnapModal: FC<{ entity: ResultData; onClose: () => void }> = ({ entity, onClose }) => {
  const [style, setStyle] = useState<CaptureStyle>("day");
  const imgUrl = captureUrl(entity, style);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  // Fit the 431x812 iframe to the preview box (cover, like the old <img>).
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => setScale(Math.max(el.clientWidth / CAPTURE_W, el.clientHeight / CAPTURE_H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pick = (id: CaptureStyle) => {
    if (id === style) return;
    setState("loading");
    setFailed(false);
    setStyle(id);
  };

  const save = useCallback(async () => {
    if (saving || state !== "ready") return;
    setSaving(true);
    setFailed(false);
    try {
      if (!(await downloadCapture(imgUrl))) setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }, [imgUrl, saving, state]);

  return (
    // Never fade opacity on an element that is (or contains) glass: browsers drop backdrop-filter while opacity < 1,
    // which made the modal look flat and then snap to glass. The backdrop blur radius animates instead, the tint
    // fades on its own sibling layer, and the card only springs in (scale/slide).
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      initial={{ backdropFilter: "blur(0px)" }}
      animate={{ backdropFilter: "blur(14.56px)" }}
      exit={{ backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-label="บันทึกภาพกระทง"
      onClick={onClose}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          // Snap bg 187:820: the blue sky (blur is on the parent)
          backgroundImage: "linear-gradient(183.82deg, var(--color-sky-top) 1.5%, var(--color-sky-bottom) 52.76%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      {/* --u = min(100vw/375, 100dvh/812) so the whole card fits without scrolling at any size */}
      <Frame
        mode="mobile"
        className="!overflow-visible shrink-0"
        style={{
          ["--u" as string]: "min(calc(100vw / 375), calc(100dvh / 812), 1.4px)",
          width: u(375),
          height: u(812),
          margin: 0,
        }}
      >
        <motion.div
          className="absolute inset-0"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 24 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <Layer
            x={18}
            y={75}
            w={343}
            h={703}
            className="overflow-clip"
            style={{
              borderRadius: u(23),
              border: `${u(1)} solid #fff`,
              backgroundImage:
                "linear-gradient(194.6239deg, rgba(255,255,255,0.33) 3.9612%, rgba(255,255,255,0.06) 99.343%)",
              backdropFilter: `blur(${u(30)})`,
              WebkitBackdropFilter: `blur(${u(30)})`,
            }}
          >
            <Layer x={0} y={20} w={343} h={30} className="flex items-center justify-center">
              <h2 className="font-ui font-normal text-white whitespace-nowrap" style={{ fontSize: u(20), lineHeight: "normal" }}>
                บันทึกภาพกระทง
              </h2>
            </Layer>

            <motion.button
              type="button"
              aria-label="ปิด"
              onClick={onClose}
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute rounded-full focus-visible:outline-2 focus-visible:outline-white"
              style={{ left: u(298), top: u(21), width: u(24), height: u(24) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="absolute block inset-0 size-full max-w-none" src="/assets/figma/river/snap-x.svg" />
            </motion.button>

            <div
              role="radiogroup"
              aria-label="สไตล์ภาพ"
              className="absolute flex"
              style={{
                left: u(61.5),
                top: u(56),
                width: u(220),
                height: u(30),
                borderRadius: u(15),
                border: `${u(1)} solid #fff`,
                padding: u(2),
              }}
            >
              {STYLES.map((o) => {
                const on = o.id === style;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pick(o.id)}
                    className="relative flex-1 font-noto font-normal focus-visible:outline-2 focus-visible:outline-white"
                    style={{ fontSize: u(14), lineHeight: "normal", borderRadius: u(13), color: on ? "#2256a3" : "#fff" }}
                  >
                    {on && (
                      <motion.span
                        layoutId="snap-style"
                        className="absolute inset-0 bg-white"
                        style={{ borderRadius: u(13), boxShadow: `0 ${u(1)} ${u(3)} rgba(0,0,0,0.2)` }}
                        transition={{ type: "spring", stiffness: 500, damping: 36 }}
                      />
                    )}
                    <span className="relative">{o.label}</span>
                  </button>
                );
              })}
            </div>

            <Layer
              x={42.8}
              y={96}
              w={257.4}
              h={485}
              className="overflow-clip"
              style={{
                borderRadius: u(16),
                border: `${u(0.5)} solid #fff`,
                backgroundImage: "linear-gradient(183.82deg, var(--color-sky-top) 1.5%, var(--color-sky-bottom) 52.76%)",
              }}
            >
              <div ref={boxRef} className="absolute inset-0 overflow-hidden">
                <iframe
                  key={`${style}#${retry}`}
                  title="ภาพกระทง"
                  aria-hidden="true"
                  tabIndex={-1}
                  loading="eager"
                  scrolling="no"
                  src={retry ? `${previewUrl(entity, style)}&r=${retry}` : previewUrl(entity, style)}
                  className="absolute left-1/2 top-1/2 block border-0 transition-opacity duration-300"
                  style={{
                    width: CAPTURE_W,
                    height: CAPTURE_H,
                    maxWidth: "none",
                    transform: `translate(-50%, -50%) scale(${scale || 0.0001})`,
                    transformOrigin: "center",
                    pointerEvents: "none",
                    opacity: state === "ready" && scale ? 1 : 0,
                  }}
                  onLoad={() => setState("ready")}
                  onError={() => setState("error")}
                />
              </div>
              {state !== "ready" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white font-ui" style={{ fontSize: u(15) }}>
                  {state === "loading" ? (
                    <>
                      <span
                        className="block animate-spin rounded-full border-white/30 border-t-white"
                        style={{ width: u(28), height: u(28), borderWidth: u(3), borderStyle: "solid" }}
                      />
                      <span>กำลังสร้างภาพ...</span>
                    </>
                  ) : (
                    <>
                      <span>สร้างภาพไม่สำเร็จ</span>
                      <button
                        type="button"
                        onClick={() => {
                          setState("loading");
                          setRetry((n) => n + 1);
                        }}
                        className="rounded-full border border-white px-4 py-1 hover:bg-white/20"
                      >
                        ลองอีกครั้ง
                      </button>
                    </>
                  )}
                </div>
              )}
            </Layer>
            <motion.button
              type="button"
              onClick={save}
              disabled={state !== "ready" || saving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="absolute flex items-center justify-center bg-white transition-[filter,opacity] hover:brightness-95 active:brightness-90 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                left: u(106),
                top: u(621),
                width: u(140),
                height: u(56.262),
                padding: u(13.084),
                borderRadius: u(66.729),
                filter: `drop-shadow(0 ${u(1.308)} ${u(3.271)} rgba(0,0,0,0.2))`,
              }}
            >
              <span
                className="font-noto font-normal text-center text-[#2256a3] whitespace-nowrap"
                style={{ fontSize: u(18.318), lineHeight: "normal", minWidth: u(54) }}
              >
                {saving ? "กำลังโหลด" : failed ? "ลองอีกครั้ง" : "บันทึก"}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="block max-w-none" style={{ width: u(24), height: u(24) }} src="/assets/figma/river/snap-download.svg" />
            </motion.button>
          </Layer>
        </motion.div>
      </Frame>
    </motion.div>
  );
};
