"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useAnimationControls } from "motion/react";
import { Layer, u } from "./frame";
import { GlassBackdrop, GlassSheet, StageFrame } from "./glass";

/**
 * Shared pieces of the Scene 5 (91:715) / Scene 6 (91:786) screens: /create, /principal, /CUPSAA.
 * All coordinates are card-relative design px (card = 343 x 703 at (16, 72) in the 375 x 812 frame).
 */

const A = "/assets/figma/create";
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2256a3]/60";
const SHADOW_FILTER = `drop-shadow(0 ${u(1)} ${u(2.5)} rgba(0,0,0,0.2))`;

/**
 * Persistent shell of the builder screens: full-viewport glass backdrop + the centred, scaled stage.
 * Put the step(s) (`BuilderStage`) inside an `AnimatePresence mode="wait"` so steps cross-fade
 * while the backdrop stays mounted. `reducedMotion="user"` drops the transforms (keeps opacity).
 */
export function BuilderShell({ nav = true, children }: { nav?: boolean; children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <main data-scene="builder" className="fixed inset-0 overflow-hidden font-ui" style={{ background: "var(--color-sky-bottom, #1d9fa6)" }}>
        <GlassBackdrop nav={nav} />
        <StageFrame>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </StageFrame>
      </main>
    </MotionConfig>
  );
}

/**
 * One step: glass card + title + kratong preview slot. `children` go inside the card.
 * Must be a direct child of `BuilderShell` (with a unique `key`) so it can animate in/out.
 * `previewKey` changes whenever the previewed kratong changes: the preview pops and fades in.
 */
export function BuilderStage({
  title,
  preview,
  previewKey,
  children,
}: {
  title: string;
  /** The live kratong renderer; centred above the shadow ellipse. */
  preview: ReactNode;
  previewKey?: string;
  children?: ReactNode;
}) {
  const pop = useAnimationControls();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pop.start({ scale: [0.92, 1.07, 1], opacity: [0.55, 1, 1], transition: { duration: 0.4, ease: "easeOut" } });
  }, [previewKey, pop]);

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ y: 14, scale: 0.98 }}
      animate={{ y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }}
      exit={{ y: -10, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } }}
    >
      <FadingGlassCard>
        <Layer
          x={0}
          y={31 - 14}
          w={343}
          h={28}
          className="flex items-center justify-center text-center font-ui text-white"
          style={{ fontSize: u(20), lineHeight: "normal" }}
        >
          <h1 className="font-normal">{title}</h1>
        </Layer>
        {/* Shadow ellipse (soft-light blend must sit on the wrapper, not the <img>) */}
        <Layer x={81} y={194.88} w={187} h={23.762} style={{ mixBlendMode: "soft-light" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={`${A}/shadow-ellipse.svg`} className="block size-full max-w-none" />
        </Layer>
        {/* Kratong preview: figma art spans x 97-259, y 70-207. Bob (outer) + pop on change (inner). */}
        <Layer x={97.43} y={70} w={161.8} h={137.4}>
          <motion.div
            className="size-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
          >
            <motion.div
              animate={pop}
              className="flex size-full items-start justify-center"
              style={{ transformOrigin: "50% 85%" }}
            >
              {preview}
            </motion.div>
          </motion.div>
        </Layer>
        {children}
      </FadingGlassCard>
    </motion.div>
  );
}

const STEP_IN = { duration: 0.3, ease: "easeOut" } as const;
const STEP_OUT = { duration: 0.2, ease: "easeIn" } as const;

/**
 * The GlassCard (91:716 frame: 343 x 703 at 16,72, radius 23, white border, blur 30) split into layers so steps can
 * fade without the glass "snapping": browsers drop backdrop-filter while the element or an ancestor has opacity < 1,
 * so the blur radius animates on its own layer while the tint/border and the content fade as its siblings.
 */
function FadingGlassCard({ children }: { children: ReactNode }) {
  const radius = u(23);
  return (
    <Layer x={16} y={72} w={343} h={703} className="overflow-clip" style={{ borderRadius: radius }}>
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ borderRadius: radius }}
        initial={{ backdropFilter: "blur(0px)" }}
        animate={{ backdropFilter: `blur(${u(30)})`, transition: STEP_IN }}
        exit={{ backdropFilter: "blur(0px)", transition: STEP_OUT }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          border: `${u(1)} solid #fff`,
          backgroundImage: "linear-gradient(231.0258deg, rgba(255,255,255,0.3) 0%, rgba(11,11,11,0) 62.244%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: STEP_IN }}
        exit={{ opacity: 0, transition: STEP_OUT }}
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: STEP_IN }}
        exit={{ opacity: 0, transition: STEP_OUT }}
      >
        {children}
      </motion.div>
    </Layer>
  );
}

/** Glass sheet (with tab strip when `tabs`), card-relative. */
export function BuilderSheet({ header = true }: { header?: boolean }) {
  return <GlassSheet header={header} />;
}

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

/** Tabs in the 56px frosted strip at (22, 270); 3 tabs are 98 x 37 as designed, more tabs share the same 300px. */
export function TabStrip<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
}) {
  const w = (300 - 3 * (tabs.length - 1)) / tabs.length;
  const pillId = useId();
  return (
    <Layer x={22} y={270} h={37} className="flex" style={{ gap: u(3) }}>
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <motion.button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            whileHover={{ scale: 1.04, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.94 }}
            className={`relative flex items-center justify-center whitespace-nowrap font-ui font-normal ${FOCUS}`}
            style={{ width: u(w), height: u(37), borderRadius: u(18), fontSize: u(14), lineHeight: "normal" }}
          >
            {active && (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0"
                style={{ borderRadius: u(18), background: "var(--color-primary, #2256a3)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <motion.span
              className="relative"
              animate={{ color: active ? "#ffffff" : "#2256a3" }}
              transition={{ duration: 0.2 }}
            >
              {t.label}
            </motion.span>
          </motion.button>
        );
      })}
    </Layer>
  );
}

/**
 * Scrollable area under the tabs (card y 316 to 703) with the design's white scroll thumb (x 332)
 * and the bouncing chevron-down that shows while more content is below. Remount (key) it per tab.
 */
export function ScrollArea({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ top: 0, ratio: 1, canScroll: false, atEnd: true });

  useEffect(() => {
    const el = box.current;
    const content = inner.current;
    if (!el || !content) return;
    const measure = () => {
      const max = el.scrollHeight - el.clientHeight;
      setM({
        top: max > 0 ? el.scrollTop / max : 0,
        ratio: el.scrollHeight > 0 ? el.clientHeight / el.scrollHeight : 1,
        canScroll: max > 1,
        atEnd: max - el.scrollTop < 2,
      });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(content);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, []);

  // Thumb track: card y 330 to 690. Thumb length follows the visible fraction (design: 92).
  const trackTop = 338;
  const trackH = 352;
  const thumbH = Math.min(trackH, Math.max(40, m.ratio * trackH));
  const thumbY = trackTop + m.top * (trackH - thumbH);

  return (
    <>
      <Layer x={0} y={316} w={343} h={387}>
        <div
          ref={box}
          className="size-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <motion.div
            ref={inner}
            className="relative"
            style={{ paddingBottom: u(100) }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </Layer>
      {m.canScroll && (
        <Layer x={330} y={thumbY} w={4} h={thumbH} className="pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={`${A}/scroll-bar.svg`} className="block size-full max-w-none" />
        </Layer>
      )}
      {m.canScroll && !m.atEnd && (
        <Layer x={160.4} y={672} w={21.37} h={11.31} className="pointer-events-none">
          <motion.div
            className="size-full"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={`${A}/chevron-down.svg`} className="block size-full max-w-none" />
          </motion.div>
        </Layer>
      )}
    </>
  );
}

export interface Tile {
  id: string;
  name: string;
  src: string;
  /** Sign-style thumbnails are drawn on the design's 130.8 x 91.4 box; other part art is contained in the tile. */
  wide?: boolean;
}

/** 3-column grid of 86 x 86 glass tiles (Figma 91:776-780); the part art overflows the tile as designed. */
export function TileGrid({
  tiles,
  selectedId,
  onSelect,
  y = 14,
}: {
  tiles: Tile[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Top offset inside the scroll area, design px. */
  y?: number;
}) {
  return (
    <div
      className="grid"
      style={{
        paddingTop: u(y),
        paddingLeft: u(18),
        gridTemplateColumns: `repeat(3, ${u(86.095)})`,
        columnGap: u(23.9),
        rowGap: u(21),
      }}
    >
      {tiles.map((t) => {
        const selected = t.id === selectedId;
        return (
          <motion.button
            key={t.id}
            type="button"
            aria-label={t.name}
            aria-pressed={selected}
            title={t.name}
            onClick={() => onSelect(t.id)}
            whileHover={{ scale: 1.05, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.9 }}
            animate={{ borderColor: selected ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)" }}
            transition={{ duration: 0.2 }}
            className={`relative ${FOCUS}`}
            style={{
              width: u(86.095),
              height: u(86.095),
              borderRadius: u(11.41),
              borderStyle: "solid",
              borderWidth: u(1),
              backgroundImage: "linear-gradient(180.2836deg, rgba(255,255,255,0.5) 0.24631%, rgba(255,255,255,0) 121.34%)",
            }}
          >
            <motion.img
              alt={t.name}
              src={t.src}
              animate={{ scale: selected ? [1, 1.12, 1] : 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute max-w-none object-contain"
              style={
                t.wide
                  ? { width: u(130.8), height: u(91.363), left: u(-13.4), top: u(-5) }
                  : { width: u(78), height: u(78), left: u(4), top: u(4) }
              }
            />
          </motion.button>
        );
      })}
    </div>
  );
}

/** Colour swatches of the "ป้าย" row; `colors` are the 6 swatch SVGs in design order. */
export function SwatchRow({
  label,
  value,
  onChange,
  order,
}: {
  label: string;
  value: number;
  onChange: (variant: number) => void;
  /** swatch index (design order) -> sign variant index */
  order: number[];
}) {
  const xs = [26, 61, 93, 125, 157, 189];
  const ringId = useId();
  return (
    <div className="relative" style={{ height: u(95) }}>
      <div
        className="absolute font-noto text-white"
        style={{ left: u(21), top: u(24), height: u(28), fontSize: u(16), lineHeight: u(28) }}
      >
        {label}
      </div>
      {order.map((variant, i) => {
        const selected = value === variant;
        return (
          <motion.button
            key={variant}
            type="button"
            aria-label={`${label} ${i + 1}`}
            aria-pressed={selected}
            onClick={() => onChange(variant)}
            whileHover={{ scale: 1.15, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.88 }}
            className={`absolute rounded-full ${FOCUS}`}
            style={{ left: u(xs[i] - 5), top: u(52), width: u(33), height: u(33) }}
          >
            {selected && (
              <motion.img
                alt=""
                src={`${A}/swatch-ring.svg`}
                layoutId={ringId}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="absolute left-0 top-0 block size-full max-w-none"
              />
            )}
            <motion.img
              alt=""
              src={`${A}/swatch-${i}.svg`}
              animate={{ scale: selected ? [1, 1.18, 1] : 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute block max-w-none"
              style={{ left: u(5), top: u(5), width: u(23), height: u(23) }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

/** Small section heading used inside the scroll area (same style as "ป้าย"). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="font-noto text-white" style={{ paddingLeft: u(21), height: u(28), fontSize: u(16), lineHeight: u(28) }}>
      {children}
    </div>
  );
}

/** "ถัดไป >" pill at (223, 647), 107 x 43. */
export function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.06, transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.94 }}
      className={`absolute flex items-center justify-center font-noto font-normal text-white ${FOCUS}`}
      style={{
        left: u(223),
        top: u(647),
        width: u(107),
        height: u(43),
        gap: u(4),
        padding: u(10),
        borderRadius: u(51),
        fontSize: u(16),
        lineHeight: "normal",
        background: "var(--color-primary, #2256a3)",
        filter: SHADOW_FILTER,
      }}
    >
      <span>ถัดไป</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src={`${A}/chevron-right.svg`} style={{ width: u(19), height: u(21) }} className="block max-w-none" />
    </motion.button>
  );
}

/** "ย้อนกลับ" outline + primary action pill pair at (74, 647), gap 14. */
export function ActionButtons({
  onBack,
  onSubmit,
  submitLabel,
  backLabel = "ย้อนกลับ",
  busy = false,
}: {
  onBack: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  backLabel?: string;
  busy?: boolean;
}) {
  return (
    <div
      className={`absolute flex ${onSubmit ? "" : "inset-x-0 justify-center"}`}
      style={{ left: onSubmit ? u(74) : undefined, top: u(647), gap: u(14) }}
    >
      <motion.button
        type="button"
        onClick={onBack}
        disabled={busy}
        whileHover={busy ? undefined : { scale: 1.06, transition: { duration: 0.1 } }}
        whileTap={busy ? undefined : { scale: 0.94 }}
        className={`flex items-center justify-center font-noto font-normal text-white disabled:opacity-60 ${FOCUS}`}
        style={{
          width: onSubmit ? u(113) : undefined,
          height: u(43),
          padding: u(10),
          borderRadius: u(51),
          border: `${u(1.5)} solid #fff`,
          boxShadow: `0 ${u(1)} ${u(5)} 0 rgba(0,0,0,0.2)`,
          fontSize: u(16),
          lineHeight: "normal",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={`${A}/chevron-left.svg`} style={{ width: u(19), height: u(21) }} className="block max-w-none" />
        <span className="text-center" style={{ width: onSubmit ? u(59) : undefined }}>
          {backLabel}
        </span>
      </motion.button>
      {onSubmit && (
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          aria-busy={busy}
          whileHover={busy ? undefined : { scale: 1.06, transition: { duration: 0.1 } }}
          whileTap={busy ? undefined : { scale: 0.94 }}
          className={`flex items-center justify-center font-noto font-normal disabled:cursor-wait disabled:opacity-80 ${FOCUS}`}
          style={{
            width: u(130),
            height: u(43),
            padding: u(10),
            borderRadius: u(51),
            background: "#fff",
            color: "var(--color-primary, #2256a3)",
            fontSize: u(16),
            lineHeight: "normal",
            filter: SHADOW_FILTER,
          }}
        >
          {busy ? (
            <span className="flex items-center" style={{ gap: u(6) }}>
              <span
                className="animate-spin rounded-full"
                style={{
                  width: u(14),
                  height: u(14),
                  border: `${u(2)} solid rgba(34,86,163,0.3)`,
                  borderTopColor: "var(--color-primary, #2256a3)",
                }}
              />
              กำลังโหลด
            </span>
          ) : (
            submitLabel
          )}
        </motion.button>
      )}
    </div>
  );
}

/** One labelled underline input (Figma 91:824 / 91:829) with a live remaining-characters counter and optional error. */
export function WishField({
  label,
  value,
  placeholder,
  limit,
  error,
  errorTick = 0,
  top,
  lineSrc,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  limit: number;
  error?: string | null;
  /** bump to re-run the shake when the same error is raised again */
  errorTick?: number;
  /** card y of the label */
  top: number;
  lineSrc: string;
  onChange: (value: string) => void;
}) {
  const id = `wish-${top}`;
  return (
    <>
      <label
        htmlFor={id}
        className="absolute font-noto text-white"
        style={{ left: u(25), top: u(top), height: u(19), width: u(178), fontSize: u(12), lineHeight: "normal" }}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={limit}
        placeholder={placeholder}
        onChange={(e) => {
          if (e.target.value.length > limit) return;
          onChange(e.target.value);
        }}
        className="absolute bg-transparent font-noto text-[#eee] outline-hidden placeholder:text-[#eee]/70"
        style={{
          left: u(25),
          top: u(top + 31),
          width: u(281),
          height: u(23),
          paddingLeft: u(5),
          fontSize: u(14),
          lineHeight: "normal",
        }}
      />
      {error ? (
        <motion.div
          key={`line-${errorTick}`}
          className="absolute"
          style={{ left: u(25), top: u(top + 54), width: u(281), height: u(1), background: "#ff9a9a" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
        />
      ) : (
        <Layer x={25} y={top + 54} w={281} h={1}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={lineSrc} className="block size-full max-w-none" />
        </Layer>
      )}
      <div className="absolute" style={{ left: u(25), top: u(top + 65), width: u(200), minHeight: u(18) }}>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key={`${error}-${errorTick}`}
              role="alert"
              className="font-noto"
              style={{ fontSize: u(12), lineHeight: "normal", color: "#ffb3b3" }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0, x: [0, -5, 5, -3, 3, 0] }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.4 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className="absolute text-right font-noto text-white"
        style={{ left: u(254), top: u(top + 65), width: u(52), fontSize: u(14), lineHeight: "normal" }}
      >
        {limit - value.length}
      </div>
    </>
  );
}

export const lineName = `${A}/line-name.svg`;
export const lineWish = `${A}/line-wish.svg`;

/** Swatch order of the design (blue, green, purple, pink, red, orange) -> sign variant indices of KratongMap. */
export const SIGN_SWATCH_ORDER = [4, 5, 2, 3, 0, 1];
