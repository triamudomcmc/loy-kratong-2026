"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

/** How long the reveal plays before moving on (the sequence ends at about 4s). */
const HOLD_MS = 5200;

/** Moves on to the river after the reveal, or immediately on tap/click/key. */
export function RevealContinue({ skip }: { skip: boolean }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    const go = () => {
      if (done.current) return;
      done.current = true;
      router.replace("/loykratong");
    };
    router.prefetch("/loykratong");
    if (skip) return go();
    const t = window.setTimeout(go, HOLD_MS);
    window.addEventListener("keydown", go);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", go);
    };
  }, [router, skip]);

  return (
    <button
      type="button"
      aria-label="ไปลอยกระทง"
      className="absolute inset-0 z-[70] cursor-pointer"
      onClick={() => {
        if (done.current) return;
        done.current = true;
        router.replace("/loykratong");
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-x-0 font-ui text-white/70"
        style={{ bottom: "4dvh", fontSize: "clamp(12px, 1.8dvh, 18px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.4, 0.8] }}
        transition={{ delay: 3.2, duration: 2.4, repeat: Infinity, repeatType: "reverse" }}
      >
        แตะเพื่อไปต่อ
      </motion.span>
    </button>
  );
}
