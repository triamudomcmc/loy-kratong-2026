"use client";

import type { CSSProperties, FC, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import { WaterFourData, WaterOneData, WaterThreeData, WaterTwoData } from "@map/animations";
import type { ResultData } from "@types-app/kratong";
import { Layer, Moon, u } from "@components/ui";
import { KratongArt, kindOf, type RiverData, type RiverKind } from "./art";
import { POPUP_DX, POPUP_DY, WishPopup } from "./popup";
import { RIVER_H, RIVER_U, RIVER_W } from "./constants";

type LaneId = "back" | "mid" | "front";

/** Lanes of the river: kratong box (design px), label row and drift speed (design px / s). */
const LANES: Record<LaneId, { top: number; w: number; h: number; labelY: number; font: number; v: number; gap: number; x0: number; z: number; dim: string }> = {
  back: { top: 445, w: 196, h: 193, labelY: 619, font: 22.55, v: 5, gap: 700, x0: 567, z: 19, dim: "brightness-[.94]" },
  mid: { top: 485, w: 272, h: 288, labelY: 752, font: 22.55, v: 7, gap: 768, x0: 762, z: 29, dim: "brightness-[.97]" },
  front: { top: 564, w: 331, h: 340, labelY: 888, font: 27.043, v: 10, gap: 780, x0: 337, z: 39, dim: "" },
};
const MARGIN = 420;

interface Item {
  id: string;
  lane: LaneId;
  kind: RiverKind;
  data: RiverData;
  x0: number;
  v: number;
  /** length of the lane loop (design px) */
  L: number;
  top: number;
  w: number;
  h: number;
  own?: boolean;
}

interface Runtime {
  pos: number;
  box: HTMLElement | null;
  label: HTMLElement | null;
  popup: HTMLElement | null;
}

const isEntity = (d: unknown): d is ResultData =>
  !!d && typeof d === "object" && "kratong" in d && "wish" in d && !!(d as ResultData).kratong && !!(d as ResultData).wish;

function buildItems(entities: ResultData[], own: ResultData | null): Item[] {
  // principal / CUPSAA rows are no longer shown. Order is kept: the server returns pinned kratongs first, then
  // random ones, and dealing round-robin spreads the pinned ones across the three lanes.
  const shuffled = entities.filter((e) => kindOf(e) !== null);
  const back: ResultData[] = [];
  const mid: ResultData[] = [];
  const front: ResultData[] = [];
  shuffled.forEach((e, i) => [back, mid, front][i % 3].push(e));

  const make = (lane: LaneId, list: { id: string; kind: RiverKind; data: RiverData; box?: Partial<Pick<Item, "top" | "w" | "h">>; own?: boolean; x0?: number }[]): Item[] => {
    const L = Math.max(RIVER_W + MARGIN * 2, list.length * LANES[lane].gap);
    return list.map((it, i) => ({
      id: it.id,
      lane,
      kind: it.kind,
      data: it.data,
      x0: it.x0 ?? LANES[lane].x0 + i * LANES[lane].gap,
      v: it.own ? LANES[lane].v * 3 : LANES[lane].v,
      L,
      top: it.box?.top ?? LANES[lane].top,
      w: it.box?.w ?? LANES[lane].w,
      h: it.box?.h ?? LANES[lane].h,
      own: it.own,
    }));
  };
  const ent = (prefix: string, e: ResultData, i: number) => ({ id: `${prefix}-${i}`, kind: "normal" as RiverKind, data: e });

  const frontList = [
    ...(own ? [{ id: "own", kind: "normal" as RiverKind, data: own, own: true }] : []),
    ...(!own && front.length ? [ent("f", front.shift() as ResultData, 0)] : []),
    ...front.map((e, i) => ent("f", e, i + 1)),
  ];

  return [
    ...make("back", back.map((e, i) => ent("b", e, i))),
    ...make("mid", mid.map((e, i) => ent("m", e, i))),
    ...make("front", frontList),
  ];
}

/* ------------------------------------------------------------------ static scenery */

const Img: FC<{ src: string; className?: string; style?: CSSProperties }> = ({ src, className = "", style }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img alt="" draggable={false} src={src} className={`absolute block max-w-none select-none pointer-events-none ${className}`} style={style} />
);

/** Water band: SVG that bleeds past its layer by the given percentages (Figma negative inset). */
const WATER_BOB = { 1: WaterOneData, 2: WaterTwoData, 3: WaterThreeData, 4: WaterFourData } as const;

/** Each band bobs with the old site's WaterOne-Four keyframes (4s loop, offset per band). */
const Water: FC<{
  src: string;
  band: 1 | 2 | 3 | 4;
  box: [number, number, number, number];
  bleed?: [number, number, number, number];
}> = ({ src, band, box: [x, y, w, h], bleed }) => {
  const reduce = useReducedMotion();
  const { animate, transition } = WATER_BOB[band];
  return (
    <Layer x={x} y={y} w={w} h={h} className="pointer-events-none">
      <motion.div
        className="absolute inset-0"
        animate={{ y: reduce ? animate.y.map((v) => v * 0.4) : animate.y }}
        transition={reduce ? { ...transition, duration: transition.duration * 1.5 } : transition}
      >
        {bleed ? (
          <div className="absolute" style={{ inset: `${bleed[0]}% ${bleed[1]}% ${bleed[2]}% ${bleed[3]}%` }}>
            <Img src={src} className="size-full" style={{ inset: 0 }} />
          </div>
        ) : (
          <Img src={src} className="size-full" style={{ inset: 0 }} />
        )}
      </motion.div>
    </Layer>
  );
};

const CLOUD_OPACITY = 0.13;
const CLOUDS: { f: string; x: number; y: number; w: number; h: number; flip?: boolean; tilt?: boolean }[] = [
  { f: "layer3", x: 260, y: 113, w: 146.807, h: 99.006 },
  { f: "layer3", x: 1210, y: 113, w: 146.807, h: 99.006 },
  { f: "layer4", x: 154, y: 188, w: 113, h: 78 },
  { f: "layer4", x: 1104, y: 188, w: 113, h: 78 },
  { f: "layer5", x: 782, y: 142, w: 162, h: 109 },
  { f: "layer4", x: 1732, y: 148, w: 113, h: 78 },
  { f: "layer13", x: 2066, y: 139, w: 146, h: 98, flip: true },
  { f: "layer6", x: -31, y: 99, w: 185, h: 113, flip: true },
  { f: "layer6", x: 978, y: 114, w: 185, h: 113, flip: true },
  { f: "layer7", x: 527, y: 99, w: 208, h: 127 },
  { f: "layer7", x: 1477, y: 99, w: 208, h: 127, flip: true },
  { f: "layer7", x: 1892, y: 113, w: 208, h: 127 },
  { f: "layer8", x: 454, y: 150, w: 127.022, h: 96.888, tilt: true },
  { f: "layer8", x: 1404, y: 150, w: 127.022, h: 96.888, tilt: true },
  { f: "layer7", x: 2259, y: 107, w: 208, h: 127 },
];

const Clouds = () => (
  <>
    {CLOUDS.map((c, i) => (
      <Layer
        key={i}
        className="pointer-events-none"
        x={c.x}
        y={c.y}
        w={c.w}
        h={c.h}
        style={{
          opacity: CLOUD_OPACITY,
          transform: c.flip ? "scaleX(-1)" : undefined,
          ...(c.tilt ? { scale: "-1 1", rotate: "2.05deg", transform: "skewX(-0.21deg)" } : {}),
        }}
      >
        <Img src={`/assets/figma/river/clouds/${c.f}.svg`} className="inset-0 size-full" />
      </Layer>
    ))}
  </>
);

const R = "/assets/figma-v2/river";
const FIREWORKS = {
  bigWhite: `${R}/fw-white-big.gif`,
  bigYellow: `${R}/fw-yellow-big.gif`,
  singleWhite: `${R}/fw-white-single.gif`,
  singleYellow: `${R}/fw-yellow-single.gif`,
};

/** Static firework bursts (Figma Group 6310 yellow / Group 6311 white, 187:966): four SVG parts, offsets relative to the group box. */
const BURSTS = {
  yellow: {
    w: 177.886,
    h: 179.54,
    parts: [
      { f: "fw-yellow-1", x: 56.46, y: 55.24, w: 30.194, h: 33.83 },
      { f: "fw-yellow-2", x: 0, y: 0, w: 177.886, h: 179.54, iw: 150.817, ih: 148.637, rotate: 77.44 },
      { f: "fw-yellow-3", x: 94.28, y: 81.37, w: 38.587, h: 34.163, iw: 28.239, ih: 33.829, rotate: -100.98, flipY: true },
      { f: "fw-yellow-4", x: 45.94, y: 87.47, w: 51.979, h: 45.306, flipY: true },
    ],
  },
  white: {
    w: 156.284,
    h: 157.737,
    parts: [
      { f: "fw-white-1", x: 49.6, y: 48.53, w: 26.528, h: 29.722 },
      { f: "fw-white-2", x: 0, y: 0, w: 156.284, h: 157.737, iw: 132.502, ih: 130.587, rotate: 77.44 },
      { f: "fw-white-3", x: 82.83, y: 71.49, w: 33.901, h: 30.014, iw: 24.809, ih: 29.721, rotate: -100.98, flipY: true },
      { f: "fw-white-4", x: 40.36, y: 76.85, w: 45.667, h: 39.805, flipY: true },
    ],
  },
} as const;

const Burst: FC<{ color: keyof typeof BURSTS; x: number; y: number; scale?: number }> = ({ color, x, y, scale = 1 }) => {
  const b = BURSTS[color];
  return (
    <Layer x={x} y={y} w={b.w * scale} h={b.h * scale} className="pointer-events-none">
      {b.parts.map((p) => {
        const part = p as { f: string; x: number; y: number; w: number; h: number; iw?: number; ih?: number; rotate?: number; flipY?: boolean };
        return (
          <div
            key={part.f}
            className="absolute flex items-center justify-center"
            style={{ left: u(part.x * scale), top: u(part.y * scale), width: u(part.w * scale), height: u(part.h * scale) }}
          >
            <div
              className="relative flex-none"
              style={{
                width: u((part.iw ?? part.w) * scale),
                height: u((part.ih ?? part.h) * scale),
                scale: part.flipY ? "1 -1" : undefined,
                rotate: part.rotate ? `${part.rotate}deg` : undefined,
              }}
            >
              <Img src={`${R}/${part.f}.svg`} className="inset-0 size-full" />
            </div>
          </div>
        );
      })}
    </Layer>
  );
};

/* ------------------------------------------------------------------ scene */

/** Yellow glow behind a kratong: always on for the user's own, otherwise only while hovered (old `kratongCls.aura`). */
const Aura: FC<{ always: boolean; size: number }> = ({ always, size }) => (
  <div
    className={`absolute rounded-full pointer-events-none transition-opacity duration-300 ${always ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
    style={{
      left: u(-size * 0.12),
      top: u(size * 0.02),
      width: u(size * 1.04),
      height: u(size * 1.04),
      background: "radial-gradient(50% 50% at 50% 50%, rgba(254,243,199,0.55) 0%, rgba(254,243,199,0) 100%)",
    }}
  />
);

const ownBob = (k: number) => ({ y: WaterFourData.animate.y.map((v) => v * k) });

const bob = (i: number, k = 1) => ({
  animate: { y: [0, -5 * k, 0, 5 * k, 0], rotate: [0, -0.8 * k, 0, 0.8 * k, 0] },
  transition: { duration: 4.2 + (i % 4) * 0.35, repeat: Infinity, ease: "easeInOut" as const, delay: (i % 7) * 0.31 },
});

export const RiverScene: FC<{ entities: ResultData[] }> = ({ entities }) => {
  const reduce = !!useReducedMotion();
  const k = reduce ? 0.4 : 1;
  const pierControls = useAnimationControls();
  const [items, setItems] = useState<Item[]>([]);
  const [released, setReleased] = useState(false);
  const [own, setOwn] = useState<ResultData | null>(null);
  const [popups, setPopups] = useState<{ id: string; left: number; top: number; wish: ResultData["wish"]; own?: boolean }[]>([]);
  const [dropX, setDropX] = useState<number | null>(null);
  const [releasing, setReleasing] = useState(false);
  const dragged = useRef(false);
  const dragStartX = useRef(0);
  const pierBusy = useRef(false);
  const runtime = useRef(new Map<string, Runtime>());
  const scroller = useRef<HTMLDivElement>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- browser-only values (localStorage, random) are read after mount to stay SSR-safe */
  useEffect(() => {
    let entity: ResultData | null = null;
    try {
      const parsed = JSON.parse(localStorage.getItem("entity") || "null");
      if (isEntity(parsed)) entity = parsed;
    } catch {
      entity = null;
    }
    setOwn(entity);
    setReleased(localStorage.getItem("released") === "true");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const list = buildItems(entities, released ? own : null);
    if (dropX !== null) {
      const o = list.find((i) => i.own);
      if (o) o.x0 = dropX;
    }
    runtime.current.forEach((_, k) => {
      if (!list.some((i) => i.id === k)) runtime.current.delete(k);
    });
    setItems(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dropX only matters for the render that releases the kratong
  }, [entities, released, own]);

  const reg = useCallback(
    (item: Item, part: "box" | "label" | "popup") => (el: HTMLElement | null) => {
      let rt = runtime.current.get(item.id);
      if (!rt) {
        rt = { pos: item.x0, box: null, label: null, popup: null };
        runtime.current.set(item.id, rt);
      }
      rt[part] = el;
    },
    []
  );

  // one rAF loop drifts every kratong (and its label) along its lane
  useEffect(() => {
    if (items.length === 0) return;
    const speed = reduce ? 0.3 : 1;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000;
      last = now;
      for (const it of items) {
        const rt = runtime.current.get(it.id);
        if (!rt || !rt.box) continue;
        rt.pos += it.v * speed * dt;
        if (rt.pos >= it.L - MARGIN) rt.pos -= it.L;
        rt.box.style.left = u(rt.pos);
        if (rt.popup) rt.popup.style.left = u(rt.pos + POPUP_DX);
        // keep the pier spot clear while the user's kratong is still waiting there
        // (the label fades with its kratong so no orphan names float over empty water)
        // only nearer lanes that actually overlap the pier kratong (x 95..325) fade; the back lane passes behind it,
        // so narrow screens still show a populated river around the pier
        const overPier = it.lane !== "back" && rt.pos + it.w > 130 && rt.pos < 300;
        const vis = !it.own && pierBusy.current && overPier ? "0" : "1";
        if (!it.own) rt.box.style.opacity = vis;
        if (rt.label) {
          rt.label.style.left = u(rt.pos + it.w / 2);
          rt.label.style.opacity = vis;
          rt.label.style.transition = "opacity .4s";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [items, reduce]);

  useEffect(() => {
    pierBusy.current = !!own && !released;
  }, [own, released]);

  const close = useCallback(() => setPopups([]), []);
  const closeOne = useCallback((id: string) => setPopups((l) => l.filter((p) => p.id !== id)), []);

  const open = (it: Item) => {
    const rt = runtime.current.get(it.id);
    if (!rt) return;
    setPopups((l) =>
      l.some((p) => p.id === it.id)
        ? l.filter((p) => p.id !== it.id)
        : [...l, { id: it.id, left: rt.pos + POPUP_DX, top: Math.max(60, it.top + POPUP_DY), wish: it.data.wish }]
    );
  };

  // wheel pans sideways on desktop
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const laneItems = (lane: LaneId) => items.filter((i) => i.lane === lane);

  const renderLane = (lane: LaneId): ReactNode =>
    laneItems(lane).map((it, i) => (
      <div
        key={it.id}
        ref={reg(it, "box")}
        className="absolute pointer-events-none"
        style={{ left: u(it.x0), top: u(it.top), width: u(it.w), height: u(it.h), zIndex: it.own ? 5 : 1, transition: "opacity .4s" }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={it.own ? { opacity: 0 } : false}
          animate={it.own ? { ...ownBob(k), opacity: 1 } : { ...bob(i, k).animate, opacity: 1 }}
          transition={it.own ? { ...WaterFourData.transition, opacity: { duration: 0.3 } } : { ...bob(i).transition, opacity: { duration: 0.3 } }}
        >
          <motion.div
            className={`group absolute pointer-events-auto cursor-pointer transition-[filter] duration-300 hover:brightness-[1.08] active:brightness-[1.12] ${LANES[lane].dim}`}
            style={{ left: u(it.w * 0.1), top: u(it.h * 0.02), width: u(it.w * 0.8), height: u(it.h * 0.96), transformOrigin: "50% 85%" }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => open(it)}
          >
            <Aura always={!!it.own} size={it.w} />
            <KratongArt kind={it.kind} data={it.data} w={it.w * 0.8} zIndex={LANES[lane].z} />
          </motion.div>
        </motion.div>
      </div>
    ));

  const renderLabels = (lane: LaneId): ReactNode =>
    laneItems(lane).map((it) => (
      <p
        key={`l-${it.id}`}
        ref={reg(it, "label")}
        className="absolute font-noto font-normal text-white text-center whitespace-nowrap pointer-events-none"
        style={{
          left: u(it.x0 + it.w / 2),
          top: u(LANES[lane].labelY),
          fontSize: u(LANES[lane].font),
          lineHeight: "normal",
          transform: "translateX(-50%)",
          maxWidth: u(it.w + 140),
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {it.data.wish.name}
      </p>
    ));

  /** The dragged kratong glides down onto the water, then joins the front lane at the spot where it landed. */
  const releaseOwn = (offsetPx: number) => {
    const uPx = Math.max(window.innerHeight / RIVER_H, window.innerWidth / RIVER_W);
    const drop = Math.min(400, Math.max(250, 95 + offsetPx / uPx));
    setPopups((l) => l.filter((p) => p.id !== "own-pier"));
    const duration = reduce ? 0.5 : 1.1;
    // let the cancelled drag settle first, then glide onto the water
    setTimeout(() => {
      void pierControls.start({
        x: (drop - 95) * uPx,
        y: (564 - 421) * uPx,
        scale: 1.3,
        transition: { duration, ease: "easeInOut" },
      });
    }, 60);
    setTimeout(() => {
      setPopups((l) => l.filter((p) => p.id !== "own-pier"));
      setDropX(drop);
      localStorage.setItem("released", "true");
      setReleased(true);
    }, 60 + duration * 1000);
  };

  return (
    <div
      ref={scroller}
      className="h-dvh w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ ["--u" as string]: RIVER_U, background: "var(--color-sky-bottom)" }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: u(RIVER_W),
          height: u(RIVER_H),
          backgroundImage:
            "linear-gradient(183.82deg, var(--color-sky-top) 1.5%, var(--color-sky-mid) 25.649%, var(--color-sky-bottom) 52.76%)",
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        {/* city skyline (ตึกดำสนิท 1) */}
        <Layer x={-7} y={252} w={2370} h={299.722} className="overflow-hidden pointer-events-none" style={{ opacity: 0.44 }}>
          <Img src="/assets/figma-v2/river/buildings.png" style={{ left: 0, width: "100%", height: "330.89%", top: "-168.53%" }} />
        </Layer>
        <Water band={4} src={`${R}/water-4.svg`} box={[-63, 504, 2931, 512]} />

        {/* back lane */}
        <div className="absolute inset-0 z-0 pointer-events-none [&>*]:pointer-events-auto">{renderLane("back")}</div>
        <Water band={3} src={`${R}/water-3.svg`} box={[-64, 597, 2934, 512]} bleed={[-6.84, -1.02, -4.88, -1.02]} />
        {renderLabels("back")}

        {/* fireworks (animated gifs + the static bursts of the share frames) */}
        <Layer x={-4} y={84} w={430} h={322.5} className="pointer-events-none">
          <Img src={FIREWORKS.bigYellow} className="inset-0 size-full object-cover" />
        </Layer>
        <Layer x={1767} y={-17} w={516} h={387} className="pointer-events-none">
          <Img src={FIREWORKS.bigWhite} className="inset-0 size-full object-cover" />
        </Layer>
        <Layer x={825} y={-11} w={577} h={432} className="pointer-events-none" style={{ transform: "scaleX(-1)" }}>
          <Img src={FIREWORKS.bigYellow} className="inset-0 size-full object-cover" />
        </Layer>
        <Burst color="yellow" x={612} y={120} scale={1.15} />
        <Burst color="white" x={1190} y={190} />
        <Burst color="yellow" x={1640} y={80} scale={0.9} />
        <Burst color="white" x={2040} y={170} scale={1.1} />

        {/* sala: Figma Group 6302 (3378x1235) at 0.43 so its right deck and plank form the pier */}
        <Layer x={0} y={0} w={340} h={RIVER_H} className="overflow-hidden pointer-events-none">
          <Layer x={-715} y={197} w={1452.54} h={531.05}>
            <Img src="/assets/figma-v2/scenery/sala.svg" className="inset-0 size-full" />
          </Layer>
        </Layer>

        {/* mid lane */}
        <div className="absolute inset-0 z-0 pointer-events-none [&>*]:pointer-events-auto">{renderLane("mid")}</div>
        <Water band={2} src={`${R}/water-2.svg`} box={[-142, 716, 2962, 541.061]} bleed={[-6.47, -1.01, -4.62, -1.01]} />

        {renderLabels("mid")}

        {/* user's kratong on the pier, before it is released */}
        {own && !released && (
          <motion.div
            className="group absolute cursor-grab active:cursor-grabbing touch-none"
            style={{ left: u(95), top: u(421), width: u(230), height: u(236.254), zIndex: 30 }}
            drag={!releasing}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.65}
            animate={pierControls}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            whileDrag={{ scale: 1.06 }}
            onDragStart={(_, info) => {
              dragged.current = true;
              dragStartX.current = info.point.x;
            }}
            onDrag={(_, info) => {
              // old DraggableKratong: released once the pointer is dragged far enough to the right
              const uPx = Math.max(window.innerHeight / RIVER_H, window.innerWidth / RIVER_W);
              const pull = info.point.x - dragStartX.current;
              if (!releasing && pull > 130 * uPx) {
                setReleasing(true);
                void releaseOwn(pull);
              }
            }}
            onDragEnd={() => {
              setTimeout(() => (dragged.current = false), 0);
            }}
            onClick={() => {
              if (dragged.current || releasing) return;
              setPopups((l) =>
                l.some((p) => p.id === "own-pier")
                  ? l.filter((p) => p.id !== "own-pier")
                  : [...l, { id: "own-pier", left: 95 + POPUP_DX, top: 421 + POPUP_DY, wish: own.wish, own: true }]
              );
            }}
          >
            <motion.div className="absolute inset-0" {...bob(2, k)}>
              <Aura always size={230} />
              <p
                className="absolute font-noto font-normal text-white text-center whitespace-nowrap pointer-events-none"
                style={{ left: 0, width: u(230), top: u(-30), fontSize: u(22.55), lineHeight: "normal" }}
              >
                {own.wish.name}
              </p>
              <div className="absolute" style={{ left: u(23), top: u(5) }}>
                <KratongArt kind="normal" data={own} w={184} zIndex={39} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* front lane */}
        <div className="absolute inset-0 z-0 pointer-events-none [&>*]:pointer-events-auto">{renderLane("front")}</div>
        <Water band={1} src={`${R}/water-1.svg`} box={[-150, 859, 3253, 541.061]} bleed={[-6.47, -0.92, -4.62, -0.92]} />

        {renderLabels("front")}

        <AnimatePresence>
          {own && !released && (
            <motion.p
              key="hint"
              className="absolute font-noto font-normal pointer-events-none z-[8]"
              style={{ left: u(100), top: u(925), fontSize: u(21.856), color: "rgba(255,255,255,0.85)", lineHeight: "normal" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: reduce ? [0.55, 0.9, 0.55] : [0.3, 1, 0.3] }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              เลื่อนกระทงเพื่อลอย
            </motion.p>
          )}
        </AnimatePresence>

        <Clouds />
        <div className="absolute inset-0 pointer-events-none [&_*]:pointer-events-none">
          <Moon glow={{ x: 266, y: 63, size: 103 }} body={{ x: 265, y: 62, size: 105 }} />
        </div>

        <Layer x={454} y={40} w={342} h={372.642} className="pointer-events-none">
          <Img src={FIREWORKS.singleYellow} className="inset-0 size-full object-cover" />
        </Layer>
        <Layer x={1460} y={96} w={293} h={319.251} className="pointer-events-none" style={{ transform: "scaleX(-1)" }}>
          <Img src={FIREWORKS.singleWhite} className="inset-0 size-full object-cover" />
        </Layer>

        {/* wish popup */}
        <AnimatePresence>
          {popups.map((p) => (
            <div
              key={p.id}
              ref={p.own ? undefined : (el) => {
                const rt = runtime.current.get(p.id);
                if (rt) rt.popup = el;
              }}
              className="absolute z-[50]"
              style={{ left: u(p.left), top: u(p.top), width: u(360.486), height: u(279.508) }}
            >
              <WishPopup wish={p.wish} onClose={() => closeOne(p.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
