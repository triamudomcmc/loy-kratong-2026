"use client";

import type { FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Frame, Layer, u } from "@components/ui";
import type { ResultData } from "@types-app/kratong";

export const captureUrl = (entity: ResultData) => `/api/capture?data=${encodeURIComponent(JSON.stringify(entity))}`;

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
  const imgUrl = captureUrl(entity);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
          backgroundImage:
            "linear-gradient(264.4121deg, rgba(255,112,112,0.89) 0%, rgba(255,112,112,0.78) 0%, rgba(59,79,255,0.63) 110.41%)",
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
            <Layer x={0} y={30} w={343} h={30} className="flex items-center justify-center">
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

            <Layer
              x={33}
              y={81}
              w={276.188}
              h={516}
              className="overflow-clip"
              style={{
                borderRadius: u(16.355),
                border: `${u(0.477)} solid #fff`,
                backgroundImage: "linear-gradient(180deg, #c23c1e 0%, #000 35%, #236bad 70.866%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="ภาพกระทง"
                src={imgUrl}
                className="absolute inset-0 size-full max-w-none object-cover transition-opacity duration-500"
                style={{ opacity: state === "ready" ? 1 : 0 }}
                onLoad={() => setState("ready")}
                onError={() => setState("error")}
              />
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
                    <span>สร้างภาพไม่สำเร็จ</span>
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
