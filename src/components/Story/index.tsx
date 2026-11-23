"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Cloud, Layer, Logo, MobileScenery, Moon, MoonRabbitEar, MovingMoon, NavHeader, PillButton, Stage, TealSky, u, type MoonPose } from "@components/ui";

type Step = "cover" | "scene1" | "scene2" | "scene3" | "final";

/** Moon boxes per scene (Figma ปก / Scene 1, Scene 2, Scene 3, Scene 4). The moon glides between them. */
const POSES: Record<Step, MoonPose> = {
  cover: { glow: { x: 60, y: 113, size: 253 }, body: { x: 59, y: 109, size: 257 } },
  scene1: { glow: { x: 60, y: 113, size: 253 }, body: { x: 59, y: 109, size: 257 } },
  scene2: { glow: { x: 47, y: 117, size: 279 }, body: { x: 48, y: 114, size: 278 } },
  scene3: { glow: { x: 49, y: 114, size: 279 }, body: { x: 51, y: 114, size: 278 } },
  final: { glow: { x: 210, y: 90, size: 99 }, body: { x: 214, y: 93, size: 92 } },
};

const quote: CSSProperties = { lineHeight: "normal", whiteSpace: "pre" };

/** Text box positioned by its horizontal centre `cx` and top `y`, like the Figma `-translate-x-1/2` text nodes. */
function CenterText({
  cx,
  y,
  fontSize,
  className = "font-display",
  style,
  children,
}: {
  cx: number;
  y: number;
  fontSize: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute text-center text-white ${className}`}
      style={{ left: u(cx), top: u(y), fontSize: u(fontSize), transform: "translateX(-50%)", ...quote, ...style }}
    >
      {children}
    </div>
  );
}

/** Fade + slide wrapper used for every text block / button row (enter from below, leave upwards). */
function Block({ delay = 0, reduce, children }: { delay?: number; reduce: boolean | null; children: ReactNode }) {
  const d = reduce ? 6 : 18;
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0, y: d }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } }}
      exit={{ opacity: 0, y: -d, transition: { duration: 0.3, ease: "easeIn" } }}
    >
      {/* children (buttons) re-enable pointer events themselves */}
      <div className="contents [&_button]:pointer-events-auto">{children}</div>
    </motion.div>
  );
}

/** Cloud group that cross-fades with the step. */
function CloudGroup({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.div
      key={id}
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

const D = (dur: number, delay = 0) => ({ drift: 4, driftDuration: dur, driftDelay: -delay });

function BackClouds({ step }: { step: Step }) {
  return (
    <AnimatePresence>
      {step === "cover" && (
        <CloudGroup key="cover-back" id="cover-back">
          <Cloud name="story-cover-618" x={218} y={699} w={241.487} h={135.206} {...D(15, 3)} />
          <Cloud name="story-cover-629" x={-178} y={522} w={238.29} h={133.416} {...D(18, 6)} />
          <Cloud name="story-cover-640" x={313} y={522} w={238.29} h={133.416} {...D(16, 1)} />
          <Cloud name="story-cover-651" x={-119} y={664} w={238.29} h={133.416} {...D(20, 9)} />
          {/* extra clouds so the sky stays filled on wide screens */}
          <Cloud name="story-cover-629" x={-470} y={580} w={238.29} h={133.416} {...D(19, 4)} />
          <Cloud name="story-cover-640" x={560} y={600} w={238.29} h={133.416} {...D(17, 8)} />
          <Cloud name="story-cover-618" x={470} y={720} w={241.487} h={135.206} {...D(21, 2)} />
        </CloudGroup>
      )}
      {step === "scene1" && (
        <CloudGroup key="s1-back" id="s1-back">
          <Cloud name="story-scene1-546" x={218} y={707} w={241.487} h={135.206} {...D(15, 3)} />
          <Cloud name="story-scene1-557" x={218} y={355} w={189.692} h={106.206} {...D(13, 5)} />
          <Cloud name="story-scene1-568" x={-67} y={384} w={200.04} h={112} {...D(17, 8)} />
          <Cloud name="story-scene1-579" x={-177} y={451} w={238.29} h={133.416} {...D(19, 2)} />
          <Cloud name="story-scene1-579" x={289} y={435} w={238.29} h={133.416} {...D(16, 6)} />
          <Cloud name="story-scene1-601" x={-134} y={648} w={238.29} h={133.416} {...D(20, 11)} />
          <Cloud name="story-scene1-579" x={-480} y={500} w={238.29} h={133.416} {...D(18, 7)} />
          <Cloud name="story-scene1-601" x={560} y={620} w={238.29} h={133.416} {...D(22, 1)} />
        </CloudGroup>
      )}
    </AnimatePresence>
  );
}

function FrontClouds({ step }: { step: Step }) {
  return (
    <AnimatePresence>
      {step === "cover" && (
        <CloudGroup key="cover-front" id="cover-front">
          <Cloud name="story-cover-666" x={-100} y={352} w={200.04} h={112} {...D(17, 4)} />
          <Cloud name="story-cover-680" x={269} y={357} w={189.692} h={107.206} {...D(15, 9)} />
        </CloudGroup>
      )}
    </AnimatePresence>
  );
}

export function Story() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("cover");
  const [leaving, setLeaving] = useState(false);
  const locked = useRef(false);

  const go = useCallback((next: Step) => {
    if (locked.current) return;
    locked.current = true;
    setStep(next);
    setTimeout(() => (locked.current = false), 700);
  }, []);

  const create = () => {
    if (leaving) return;
    setLeaving(true);
    localStorage.setItem("story", "done");
    router.prefetch("/create");
    setTimeout(() => router.push("/create"), reduce ? 150 : 550);
  };

  const final = step === "final";
  const onCoverKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go("scene1");
    }
  };

  return (
    <main className="fixed inset-0 overflow-hidden antialiased select-none bg-sky-bottom">
      <TealSky />

      {/* ---- mobile / tablet story (also steps 0-3 on desktop) ---- */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${final ? "lg:opacity-0 lg:pointer-events-none" : ""}`}>
        {/* final scenery bleeds to the viewport bottom / sides */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: final ? (leaving ? 0 : 1) : 0 }}
          transition={{ duration: final && !leaving ? 0.9 : 0.5, delay: final && !leaving ? 0.25 : 0 }}
        >
          <Stage anchor="bottom">
            <MobileScenery water="single" />
          </Stage>
        </motion.div>

        <motion.div
          className="absolute inset-0"
          animate={leaving ? { opacity: 0, y: reduce ? 0 : -24, scale: reduce ? 1 : 1.03 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Stage>
            <BackClouds step={step} />
            <AnimatePresence>
              {(step === "scene2" || step === "scene3") && (
                <motion.div
                  key="ear"
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <MoonRabbitEar />
                </motion.div>
              )}
            </AnimatePresence>
            {/* scene 1: text sits behind the clouds and moon */}
            <AnimatePresence mode="wait">
              {step === "scene1" && (
                <Block key="s1-text" reduce={reduce}>
                  <CenterText cx={187} y={492} fontSize={27.913} style={{ width: u(182), height: u(107) }}>
                    {"“...สายัณห์สวัสดี \nราตรีนี้วันลอยกระทง\nขอชวนมาร่วมส่ง \nลอยกระทง ณ คูบัว...”"}
                  </CenterText>
                </Block>
              )}
            </AnimatePresence>

            <MovingMoon pose={POSES[step]} float={step === "final" ? 1.5 : 3} />
            <FrontClouds step={step} />

            {/* text blocks */}
            <AnimatePresence mode="wait">
              {step === "cover" && (
                <Block key="cover-text" reduce={reduce}>
                  <motion.div
                    className="absolute text-center text-white font-noto"
                    style={{ left: u(187.5), top: u(654), fontSize: u(22), x: "-50%", y: "-50%", whiteSpace: "nowrap" }}
                    animate={{ opacity: [0.27, 0.75, 0.27] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    แตะเพื่อไปต่อ
                  </motion.div>
                  <div
                    className="absolute text-center text-white font-title font-bold"
                    style={{ left: u(184.5), top: u(490.5), width: u(275), fontSize: u(43.215), transform: "translate(-50%, -50%)", lineHeight: "normal" }}
                  >
                    ลอยกระทง
                  </div>
                  <div
                    className="absolute text-center text-white font-title font-bold"
                    style={{ left: u(185.5), top: u(540.5), width: u(303), fontSize: u(43.215), transform: "translate(-50%, -50%)", lineHeight: "normal" }}
                  >
                    ออนไลน์
                  </div>
                  <div
                    className="absolute text-center text-white font-title font-semibold"
                    style={{ left: u(182), top: u(586.03), width: u(188), height: u(44.053), fontSize: u(26.814), transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "normal" }}
                  >
                    ๒๕๖๙
                  </div>
                </Block>
              )}
              {step === "scene2" && (
                <Block key="s2-text" reduce={reduce}>
                  <CenterText cx={187.5} y={471} fontSize={28}>
                    {"“...วันนี้วันเพ็ญ\nเดือนสิบสองนะ...”"}
                  </CenterText>
                  <CenterText cx={187.5} y={553} fontSize={28}>
                    {"“...มาลอยกระทง\nด้วยกันไหม...”"}
                  </CenterText>
                </Block>
              )}
              {step === "scene3" && (
                <Block key="s3-text" reduce={reduce}>
                  <CenterText cx={187.5} y={493} fontSize={32} style={{ width: u(193), height: u(102) }}>
                    {"“มาเถอะหน่า\nอยากไปกับเธอ\nจริง ๆ นะ !”"}
                  </CenterText>
                </Block>
              )}
              {final && (
                <Block key="final-text" reduce={reduce}>
                  <CenterText cx={188} y={260} fontSize={36} style={{ width: u(272), height: u(32) }}>
                    โอเค ไปลอยกระทงกัน !
                  </CenterText>
                </Block>
              )}
            </AnimatePresence>

            {/* buttons (slightly after the text) */}
            <AnimatePresence mode="wait">
              {step === "scene1" && (
                <Block key="s1-btn" delay={0.12} reduce={reduce}>
                  <PillButton x={127} y={634} onClick={() => go("scene2")}>
                    ถัดไป
                  </PillButton>
                </Block>
              )}
              {step === "scene2" && (
                <Block key="s2-btn" delay={0.12} reduce={reduce}>
                  <PillButton variant="outline" x={59} y={643} onClick={() => go("scene3")}>
                    ไม่ไป
                  </PillButton>
                  <PillButton x={197} y={643} onClick={() => go("final")}>
                    ไป
                  </PillButton>
                </Block>
              )}
              {step === "scene3" && (
                <Block key="s3-btn" delay={0.12} reduce={reduce}>
                  <PillButton x={94} y={638} w={187} h={42} onClick={() => go("final")}>
                    โอเค ๆ ไปก็ได้
                  </PillButton>
                </Block>
              )}
              {final && (
                <Block key="final-btn" delay={0.2} reduce={reduce}>
                  <PillButton x={129} y={330} onClick={create}>
                    สร้างกระทง
                  </PillButton>
                </Block>
              )}
            </AnimatePresence>

            <div className="lg:hidden">
              <NavHeader />
            </div>
          </Stage>
        </motion.div>

        {/* Desktop: pin the logo to the viewport corner (as on the builder and river) instead of the centred column. */}
        {!final && (
          <div
            className="absolute z-[99] hidden lg:block"
            style={{ left: "calc(100vw / 1440 * 37)", top: "calc(100vw / 1440 * 34)", ["--u" as string]: "calc(100vw / 1440)" }}
          >
            <Logo scale={254 / 102} />
          </div>
        )}

        {/* cover: tap anywhere */}
        {step === "cover" && (
          <div
            className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
            role="button"
            tabIndex={0}
            aria-label="แตะเพื่อไปต่อ"
            onClick={() => go("scene1")}
            onKeyDown={onCoverKey}
          />
        )}
      </div>

      {/* ---- Scene 17: desktop final (>= lg) ---- */}
      <motion.div
        className="absolute inset-0 hidden lg:block"
        initial={false}
        animate={{ opacity: final && !leaving ? 1 : 0 }}
        transition={{ duration: final && !leaving ? 0.9 : 0.5, delay: final && !leaving ? 0.2 : 0 }}
        style={{ pointerEvents: final ? "auto" : "none" }}
      >
        <div className="absolute inset-0">
          <TealSky desktop />
        </div>
        <DesktopFinal onCreate={create} show={final} reduce={reduce} />
      </motion.div>
    </main>
  );
}

/** Scene 17 91:1191 (desktop final, 1440 x 1024), scaled to fit the viewport and anchored to the bottom. */
function DesktopFinal({ onCreate, show, reduce }: { onCreate: () => void; show: boolean; reduce: boolean | null }) {
  const S = "/assets/figma/ui/scenery";
  return (
    <Stage desktop anchor="bottom">
      <Layer x={-189.07} y={778.04} w={2962.0} h={512}>
        <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${S}/water-desktop-back.svg`} />
      </Layer>
      <Layer x={-184.03} y={856.0} w={3253.1} h={512}>
        <img alt="" className="absolute block inset-0 size-full max-w-none" src={`${S}/water-desktop-front.svg`} />
      </Layer>
      <Layer x={-17} y={192} w={1456.944} h={1456.944}>
        <div className="absolute flex items-center justify-center size-full">
          <div className="relative flex-none" style={{ width: u(1445), height: u(1445), transform: "rotate(0.48deg)" }}>
            <img alt="ศาลา" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src={`${S}/sala.png`} />
          </div>
        </div>
      </Layer>
      <Moon glow={{ x: 1039, y: 56, size: 202 }} body={{ x: 1042.7, y: 56, size: 198.298 }} />
      <Cloud name="story-desktop-1198" x={104.44} y={83.196} w={289.344} h={162} rotate={5.8} drift={4} driftDuration={16} />
      <Cloud name="story-desktop-1209" x={-57.61} y={168.13} w={302.106} h={162.602} rotate={4.1} drift={4} driftDuration={19} driftDelay={-5} />
      <Cloud name="story-desktop-1220" x={1241} y={164} w={253.622} h={142} drift={4} driftDuration={17} driftDelay={-8} />
      <Cloud name="story-desktop-1231" x={1167} y={96} w={217.9} h={122} drift={4} driftDuration={14} driftDelay={-2} />
      {/* clouds beyond the frame, for ultra-wide screens */}
      <Cloud name="story-desktop-1209" x={-420} y={90} w={302.106} h={162.602} rotate={4.1} drift={4} driftDuration={21} driftDelay={-3} />
      <Cloud name="story-desktop-1220" x={1580} y={110} w={253.622} h={142} drift={4} driftDuration={18} driftDelay={-6} />
      <AnimatePresence>
        {show && (
          <motion.div
            key="d-content"
            className="absolute flex flex-col items-center"
            style={{ left: u(440), top: u(159), gap: u(41) }}
            initial={{ opacity: 0, y: reduce ? 6 : 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5, ease: "easeOut" } }}
            exit={{ opacity: 0 }}
          >
            <p className="font-display text-center text-white" style={{ width: u(561), height: u(66), fontSize: u(74.25), lineHeight: "normal" }}>
              โอเค ไปลอยกระทงกัน !
            </p>
            <PillButton w={225} h={80} radius={40} fontSize={28} onClick={onCreate}>
              สร้างกระทง
            </PillButton>
          </motion.div>
        )}
      </AnimatePresence>
      <NavHeader desktop />
    </Stage>
  );
}
