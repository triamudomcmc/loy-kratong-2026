"use client";

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Cloud, Layer, Logo, MobileScenery, MovingMoon, NavHeader, PillButton, Stage, TealSky, u, type MoonPose } from "@components/ui";
import { Kratong } from "@components/Kratong/kratong";
import type { KratongSelected } from "@types-app/kratong";

type Step = "cover" | "final";

/** Moon boxes per scene (Figma ปก 187:476 / 195:629, Scene 22 203:2258). The moon glides between them. */
const POSES: Record<Step, MoonPose> = {
  cover: { glow: { x: 60, y: 113, size: 253 }, body: { x: 60, y: 113, size: 257 } },
  final: { glow: { x: 219, y: 63, size: 129 }, body: { x: 219, y: 63, size: 131 } },
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
          <Cloud name="cloud-cover-bottom-right" x={218} y={699} w={241.487} h={135.206} {...D(15, 3)} />
          <Cloud name="cloud-cover-left-mid" x={-178} y={522} w={238.29} h={133.416} {...D(18, 6)} />
          <Cloud name="cloud-cover-right-mid" x={313} y={522} w={238.29} h={133.416} {...D(16, 1)} />
          <Cloud name="cloud-cover-left-bottom" x={-119} y={664} w={238.29} h={133.416} {...D(20, 9)} />
          {/* extra clouds so the sky stays filled on wide screens */}
          <Cloud name="cloud-cover-left-mid" x={-470} y={580} w={238.29} h={133.416} {...D(19, 4)} />
          <Cloud name="cloud-cover-right-mid" x={560} y={600} w={238.29} h={133.416} {...D(17, 8)} />
          <Cloud name="cloud-cover-bottom-right" x={470} y={720} w={241.487} h={135.206} {...D(21, 2)} />
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
          <Cloud name="cloud-cover-left-top" x={-100} y={352} w={200.04} h={112} {...D(17, 4)} />
          <Cloud name="cloud-cover-right-top" x={269} y={357} w={189.692} h={107.206} {...D(15, 9)} />
        </CloudGroup>
      )}
    </AnimatePresence>
  );
}

const sel = (base: string, flowers: string, candles: string): KratongSelected => ({
  base,
  flowers,
  candles,
  decorations: "none",
  signVariant: 0,
});

/**
 * The kratongs floating on Scene 22's water: real parts rendered by <Kratong> (unlit), placed from the Figma groups
 * (centre 195:6463 98.8,665.8 178.6 wide; left 195:5911 kratong 118.9 wide at -64.1,686.7). The right group (195:6115)
 * sits off-canvas except for its ripple. `size` = the kratong's design width x 341 / base width; bottom = box bottom.
 */
const FLOATERS: { sel: KratongSelected; left: number; bottom: number; size: number; z: number; bob: number; delay: number }[] = [
  { sel: sel("green-lotus-large", "none", "candle-orange"), left: -64.1, bottom: 771.84, size: 118.94, z: 1, bob: 1.6, delay: 0.4 },
  { sel: sel("green-lotus-large", "none", "candle-orange"), left: 98.8, bottom: 791.7, size: 178.6, z: 2, bob: 2.6, delay: 0 },
];

/** Static water details of the floating groups: left shadow (multiply) and the two ripples (195:5911 / 195:6115). */
function Ripples() {
  const img = (src: string, x: number, y: number, w: number, h: number, extra?: CSSProperties) => (
    <Layer x={x} y={y} w={w} h={h} style={extra}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="absolute block inset-0 size-full max-w-none" src={src} />
    </Layer>
  );
  return (
    <>
      {img("/assets/figma-v2/scenery/ripple-left.svg", -87.78, 756.96, 181.034, 20.014)}
      {img("/assets/figma-v2/scenery/ripple-right.svg", 351.73, 737.07, 181.034, 20.014)}
      <div className="absolute inset-0" style={{ mixBlendMode: "multiply" }}>
        {img("/assets/figma-v2/scenery/shadow-left.svg", -59.99, 751.21, 109.115, 57.273, { transform: "rotate(180deg)" })}
      </div>
    </>
  );
}

function Floaters({ reduce }: { reduce: boolean | null }) {
  return (
    <>
      <Ripples />
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ left: u(f.left), top: u(f.bottom - f.size * 1.171875), width: u(f.size), height: u(f.size * 1.171875), zIndex: f.z }}
          animate={reduce ? undefined : { y: [0, -f.bob, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
        >
          <Kratong selected={f.sel} height={u(f.size)} zIndex={f.z} lit={false} />
        </motion.div>
      ))}
    </>
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
      go("final");
    }
  };

  return (
    <main className="fixed inset-0 overflow-hidden antialiased select-none bg-sky-bottom">
      <TealSky />

      {/* final scenery (Scene 22) bleeds to the viewport bottom / sides */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: final ? (leaving ? 0 : 1) : 0 }}
        transition={{ duration: final && !leaving ? 0.9 : 0.5, delay: final && !leaving ? 0.25 : 0 }}
      >
        <Stage anchor="bottom">
          <MobileScenery water="layered" />
          <Floaters reduce={reduce} />
        </Stage>
      </motion.div>

      <motion.div
        className="absolute inset-0"
        animate={leaving ? { opacity: 0, y: reduce ? 0 : -24, scale: reduce ? 1 : 1.03 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Stage>
          <BackClouds step={step} />
          <MovingMoon pose={POSES[step]} float={final ? 1.5 : 3} />
          <FrontClouds step={step} />

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
                  style={{ left: u(187.5), top: u(490.5), width: u(275), fontSize: u(43.215), transform: "translate(-50%, -50%)", lineHeight: "normal" }}
                >
                  ลอยกระทง
                </div>
                <div
                  className="absolute text-center text-white font-title font-bold"
                  style={{ left: u(187.5), top: u(540.5), width: u(303), fontSize: u(43.215), transform: "translate(-50%, -50%)", lineHeight: "normal" }}
                >
                  ออนไลน์
                </div>
                <div
                  className="absolute text-center text-white font-title font-semibold"
                  style={{ left: u(187.5), top: u(586.03), width: u(188), height: u(44.053), fontSize: u(26.814), transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: "normal" }}
                >
                  ๒๕๖๙
                </div>
              </Block>
            )}
            {final && (
              <Block key="final-text" reduce={reduce}>
                <CenterText cx={192} y={261} fontSize={32} style={{ width: u(336), height: u(32) }}>
                  พร้อมที่จะลอยกระทงแล้วหรือยัง !
                </CenterText>
              </Block>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
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
      <div
        className="absolute z-[99] hidden lg:block"
        style={{ left: "calc(100vw / 1440 * 37)", top: "calc(100vw / 1440 * 34)", ["--u" as string]: "calc(100vw / 1440)" }}
      >
        <Logo scale={254 / 102} />
      </div>

      {/* cover: tap anywhere */}
      {step === "cover" && (
        <div
          className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
          role="button"
          tabIndex={0}
          aria-label="แตะเพื่อไปต่อ"
          onClick={() => go("final")}
          onKeyDown={onCoverKey}
        />
      )}
    </main>
  );
}
