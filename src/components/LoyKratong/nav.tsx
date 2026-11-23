"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import type { ResultData } from "@types-app/kratong";
import { Logo, u } from "@components/ui";
import { SnapModal } from "./snap";
import { RIVER_U } from "./constants";

/** River header: logo (Nav 91:936) and the dark "บันทึกภาพกระทง" pill (Group 406, 91:937), sharing the river's `--u`. */
export function NavLoy() {
  const router = useRouter();
  const [entity, setEntity] = useState<ResultData | null>(null);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("entity") || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only available after mount
      if (parsed?.kratong && parsed?.wish) setEntity(parsed);
    } catch {
      /* no saved kratong */
    }
  }, []);

  const move = () => {
    localStorage.removeItem("entity");
    localStorage.removeItem("entityId");
    localStorage.removeItem("released");
    router.push("/create");
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[99] pointer-events-none" style={{ ["--u" as string]: RIVER_U }}>
        <div className="absolute" style={{ left: u(24), top: u(19) }}>
          <Logo />
        </div>
        <motion.button
          type="button"
          disabled={!entity}
          onClick={() => setSnap(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="pointer-events-auto absolute flex items-center text-white bg-[#051018] transition-[filter] hover:brightness-125 active:brightness-150 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            right: u(28.682),
            top: u(33),
            width: u(174.318),
            height: u(43),
            borderRadius: u(32.778),
            border: `${u(1.5)} solid #fff`,
            boxShadow: `0 0 ${u(3.319)} rgba(0,0,0,0.25)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="absolute block max-w-none" style={{ left: u(17.5), top: u(7.5), width: u(24), height: u(24) }} src="/assets/figma/river/icon-download.svg" />
          <span
            className="absolute font-noto font-normal whitespace-nowrap"
            style={{ left: u(44.5), top: u(8.5), fontSize: u(16.597), lineHeight: u(22) }}
          >
            บันทึกภาพกระทง
          </span>
        </motion.button>
      </header>
      <motion.button
        type="button"
        onClick={move}
        whileHover={{ x: -3, scale: 1.04 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className="fixed bottom-6 left-6 z-[99] flex items-center gap-2 rounded-full px-2 py-1 text-sm text-white font-ui hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ArrowLeftIcon className="w-5 h-5" /> <span>สร้างกระทงเพิ่ม</span>
      </motion.button>
      <AnimatePresence>{snap && entity && <SnapModal key="snap" entity={entity} onClose={() => setSnap(false)} />}</AnimatePresence>
    </>
  );
}
